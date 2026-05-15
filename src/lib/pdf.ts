import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs/promises'
import path from 'path'
import type { TemplatePositions } from '@/types'

// Default font: Helvetica (fallback — Aptos unavailable in most server environments)
// Position configuration is stored in Template.configuracao_posicoes and passed in

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return rgb(0, 0, 0)
  return rgb(
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  )
}

function wrapText(text: string, maxWidth: number, fontSize: number, avgCharWidth: number): string[] {
  const charsPerLine = Math.floor(maxWidth / (fontSize * avgCharWidth))
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if ((current + ' ' + word).trim().length > charsPerLine) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  }
  if (current) lines.push(current.trim())
  return lines
}

export interface PosterPdfData {
  descricaoProduto: string
  precoLoja: string
  precoAppSite: string
  textoLegal: string
  formato: 'A4' | 'A6'
  positions: TemplatePositions
}

export async function generatePosterPdf(posters: PosterPdfData[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  for (const poster of posters) {
    const templatePath = path.join(process.cwd(), 'public', 'templates', `${poster.formato}.png`)
    const templateBytes = await fs.readFile(templatePath)
    const templateImage = await pdfDoc.embedPng(templateBytes)

    const pos = poster.positions
    const page = pdfDoc.addPage([pos.pageWidth, pos.pageHeight])

    // Draw template as full background
    page.drawImage(templateImage, {
      x: 0,
      y: 0,
      width: pos.pageWidth,
      height: pos.pageHeight,
    })

    // Descrição do produto — wrap text
    const descLines = wrapText(poster.descricaoProduto, pos.descricao.maxWidth, pos.descricao.fontSize, 0.55)
    descLines.forEach((line, i) => {
      page.drawText(line, {
        x: pos.descricao.x,
        y: pos.descricao.y - i * (pos.descricao.fontSize * 1.3),
        size: pos.descricao.fontSize,
        font: fontBold,
        color: hexToRgb('#1a1a1a'),
      })
    })

    // Preço loja
    page.drawText(`R$ ${poster.precoLoja}`, {
      x: pos.precoLoja.x,
      y: pos.precoLoja.y,
      size: pos.precoLoja.fontSize,
      font,
      color: hexToRgb('#444444'),
    })

    // Preço APP/SITE — destaque
    page.drawText(`R$ ${poster.precoAppSite}`, {
      x: pos.precoAppSite.x,
      y: pos.precoAppSite.y,
      size: pos.precoAppSite.fontSize,
      font: fontBold,
      color: hexToRgb('#1a1a1a'),
    })

    // Texto legal — wrap text
    const legalLines = wrapText(poster.textoLegal, pos.textoLegal.maxWidth, pos.textoLegal.fontSize, 0.52)
    legalLines.forEach((line, i) => {
      page.drawText(line, {
        x: pos.textoLegal.x,
        y: pos.textoLegal.y - i * pos.textoLegal.lineHeight,
        size: pos.textoLegal.fontSize,
        font,
        color: hexToRgb('#ffffff'),
      })
    })
  }

  return pdfDoc.save()
}

export async function savePdfToStorage(bytes: Uint8Array, filename: string): Promise<string> {
  const storageDir = path.join(process.cwd(), 'pdfs-storage')
  await fs.mkdir(storageDir, { recursive: true })
  const filepath = path.join(storageDir, filename)
  await fs.writeFile(filepath, bytes)
  return filepath
}

export async function deletePdfFromStorage(storagePath: string): Promise<void> {
  try {
    await fs.unlink(storagePath)
  } catch {
    // File may already be deleted
  }
}
