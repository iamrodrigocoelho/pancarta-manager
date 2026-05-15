import { prisma } from './prisma'
import { deletePdfFromStorage } from './pdf'

export async function runCleanup(): Promise<{ expiredPosters: number; expiredPdfs: number }> {
  const now = new Date()
  console.log(`[CLEANUP] Starting cleanup at ${now.toISOString()}`)

  // Expire old posters
  const expiredPosters = await prisma.poster.updateMany({
    where: {
      expira_em: { lt: now },
      status: {
        notIn: ['EXPIRADA', 'CANCELADA'],
      },
    },
    data: { status: 'EXPIRADA' },
  })

  // Find and delete expired PDFs
  const expiredPdfFiles = await prisma.pdfFile.findMany({
    where: {
      expira_em: { lt: now },
      status: 'DISPONIVEL',
    },
  })

  let expiredPdfs = 0
  for (const pdf of expiredPdfFiles) {
    await deletePdfFromStorage(pdf.storage_path)
    await prisma.pdfFile.update({
      where: { id: pdf.id },
      data: { status: 'EXPIRADO' },
    })

    await prisma.auditLog.create({
      data: {
        acao: 'EXCLUSAO_PDF',
        entidade: 'PdfFile',
        entidade_id: pdf.id,
        dados_anteriores: { nome_arquivo: pdf.nome_arquivo },
        ip: null,
        user_agent: null,
      },
    })
    expiredPdfs++
  }

  console.log(
    `[CLEANUP] Done: ${expiredPosters.count} posters expired, ${expiredPdfs} PDFs deleted`
  )
  return { expiredPosters: expiredPosters.count, expiredPdfs }
}
