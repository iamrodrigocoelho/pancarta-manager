import { describe, it, expect } from 'vitest'
import { generateLegalText } from '@/lib/legal-text'

describe('generateLegalText', () => {
  it('generates correct text with all fields', () => {
    const result = generateLegalText({
      dataValidade: '31/12/2025',
      canalOferta: 'APP',
      ean: '7891234567890',
      codigoProduto: 'PROD001',
    })

    expect(result).toBe(
      'Promoção válida até 31/12/2025. Oferta exclusiva APP, enquanto durarem os estoques. EAN: 7891234567890 | CÓD: PROD001'
    )
  })

  it('handles special characters in canal_oferta', () => {
    const result = generateLegalText({
      dataValidade: '15/06/2025',
      canalOferta: 'APP & SITE',
      ean: '1234567890123',
      codigoProduto: 'X-99',
    })

    expect(result).toContain('Oferta exclusiva APP & SITE,')
    expect(result).toContain('EAN: 1234567890123')
    expect(result).toContain('CÓD: X-99')
  })

  it('handles long EAN numbers', () => {
    const longEan = '12345678901234567890'
    const result = generateLegalText({
      dataValidade: '01/01/2026',
      canalOferta: 'SITE',
      ean: longEan,
      codigoProduto: 'LONG001',
    })

    expect(result).toContain(`EAN: ${longEan}`)
  })

  it('handles different date formats as strings', () => {
    // The function treats dataValidade as a raw string — it passes through unchanged
    const result = generateLegalText({
      dataValidade: '2025-12-31',
      canalOferta: 'APP',
      ean: '789',
      codigoProduto: 'P1',
    })

    expect(result).toBe(
      'Promoção válida até 2025-12-31. Oferta exclusiva APP, enquanto durarem os estoques. EAN: 789 | CÓD: P1'
    )
  })

  it('generates text that contains all mandatory keywords', () => {
    const result = generateLegalText({
      dataValidade: '30/06/2025',
      canalOferta: 'Loja',
      ean: '111',
      codigoProduto: '222',
    })

    expect(result).toContain('Promoção válida até')
    expect(result).toContain('Oferta exclusiva')
    expect(result).toContain('enquanto durarem os estoques')
    expect(result).toContain('EAN:')
    expect(result).toContain('CÓD:')
  })

  it('uses the pipe separator between EAN and code', () => {
    const result = generateLegalText({
      dataValidade: '01/01/2025',
      canalOferta: 'APP',
      ean: '555',
      codigoProduto: '666',
    })

    expect(result).toContain('EAN: 555 | CÓD: 666')
  })

  it('handles empty string inputs without throwing', () => {
    expect(() =>
      generateLegalText({
        dataValidade: '',
        canalOferta: '',
        ean: '',
        codigoProduto: '',
      })
    ).not.toThrow()
  })
})
