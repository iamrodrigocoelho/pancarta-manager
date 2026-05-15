import { describe, it, expect } from 'vitest'
import { csvPosterRowSchema, MAX_CSV_ROWS } from '@/lib/csv-schemas'

// ─── Fixture: a fully valid poster row ────────────────────────────────────────

const validRow = {
  descricao_produto: 'Suco de Laranja 1L',
  preco_loja: '5.99',
  preco_app_site: '4.99',
  ean: '7891234567890',
  codigo_produto: 'SUC001',
  data_validade: '31/12/2025',
  canal_oferta: 'APP',
  formato: 'A4',
  loja: '001',
  campanha: 'Verão 2025',
} as const

describe('csvPosterRowSchema', () => {
  // ── Happy path ──────────────────────────────────────────────────────────────

  it('validates a fully correct row without errors', () => {
    const result = csvPosterRowSchema.safeParse(validRow)
    expect(result.success).toBe(true)
  })

  it('allows optional fields to be absent', () => {
    const { loja, campanha, ...required } = validRow
    void loja
    void campanha
    const result = csvPosterRowSchema.safeParse(required)
    expect(result.success).toBe(true)
  })

  it('accepts A6 as a valid formato', () => {
    const row = { ...validRow, formato: 'A6' }
    const result = csvPosterRowSchema.safeParse(row)
    expect(result.success).toBe(true)
  })

  // ── Missing required fields ─────────────────────────────────────────────────

  it('fails when descricao_produto is empty', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, descricao_produto: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message)
      expect(messages).toContain('Descrição obrigatória')
    }
  })

  it('fails when preco_loja is empty', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, preco_loja: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message)
      expect(messages).toContain('Preço loja obrigatório')
    }
  })

  it('fails when preco_app_site is empty', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, preco_app_site: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message)
      expect(messages).toContain('Preço APP/SITE obrigatório')
    }
  })

  it('fails when ean is empty', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, ean: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message)
      expect(messages).toContain('EAN obrigatório')
    }
  })

  it('fails when codigo_produto is empty', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, codigo_produto: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message)
      expect(messages).toContain('Código do produto obrigatório')
    }
  })

  it('fails when canal_oferta is empty', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, canal_oferta: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message)
      expect(messages).toContain('Canal da oferta obrigatório')
    }
  })

  it('fails when data_validade is empty', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, data_validade: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message)
      expect(messages).toContain('Data de validade obrigatória')
    }
  })

  // ── EAN validation ──────────────────────────────────────────────────────────

  it('fails when EAN contains non-numeric characters', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, ean: '789ABC123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message)
      expect(messages).toContain('EAN deve ser numérico')
    }
  })

  it('fails when EAN contains letters only', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, ean: 'ABCDEF' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message)
      expect(messages).toContain('EAN deve ser numérico')
    }
  })

  it('passes when EAN is a long numeric string', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, ean: '12345678901234' })
    expect(result.success).toBe(true)
  })

  // ── Date validation ─────────────────────────────────────────────────────────

  it('fails for ISO date format (YYYY-MM-DD)', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, data_validade: '2025-12-31' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e: {message: string}) => e.message)
      expect(messages).toContain('Data inválida (use DD/MM/AAAA)')
    }
  })

  it('fails for MM/DD/YYYY format', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, data_validade: '12/31/2025' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e: {message: string}) => e.message)
      expect(messages).toContain('Data inválida (use DD/MM/AAAA)')
    }
  })

  it('fails for an impossible date like 31/02/2025', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, data_validade: '31/02/2025' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e: {message: string}) => e.message)
      expect(messages).toContain('Data inválida (use DD/MM/AAAA)')
    }
  })

  it('passes for a valid date in DD/MM/YYYY format', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, data_validade: '01/01/2026' })
    expect(result.success).toBe(true)
  })

  // ── Formato validation ──────────────────────────────────────────────────────

  it('fails when formato is neither A4 nor A6', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, formato: 'A3' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e: {message: string}) => e.message)
      expect(messages).toContain('Formato deve ser A4 ou A6')
    }
  })

  it('fails when formato is lowercase', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, formato: 'a4' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((e: {message: string}) => e.message)
      expect(messages).toContain('Formato deve ser A4 ou A6')
    }
  })

  it('fails when formato is an empty string', () => {
    const result = csvPosterRowSchema.safeParse({ ...validRow, formato: '' })
    expect(result.success).toBe(false)
  })
})

// ─── MAX_CSV_ROWS ─────────────────────────────────────────────────────────────

describe('MAX_CSV_ROWS', () => {
  it('is exactly 200', () => {
    expect(MAX_CSV_ROWS).toBe(200)
  })

  it('is a positive integer', () => {
    expect(typeof MAX_CSV_ROWS).toBe('number')
    expect(MAX_CSV_ROWS).toBeGreaterThan(0)
    expect(Number.isInteger(MAX_CSV_ROWS)).toBe(true)
  })

  it('rejects arrays exceeding the limit when checked against MAX_CSV_ROWS', () => {
    // Simulate the upload validation logic:
    // rows.length > MAX_CSV_ROWS should be true for 201 rows
    const rows201 = Array.from({ length: 201 }, (_, i) => ({ id: i }))
    expect(rows201.length > MAX_CSV_ROWS).toBe(true)
  })

  it('accepts arrays at exactly the limit', () => {
    const rows200 = Array.from({ length: 200 }, (_, i) => ({ id: i }))
    expect(rows200.length > MAX_CSV_ROWS).toBe(false)
  })

  it('accepts arrays below the limit', () => {
    const rows10 = Array.from({ length: 10 }, (_, i) => ({ id: i }))
    expect(rows10.length > MAX_CSV_ROWS).toBe(false)
  })
})
