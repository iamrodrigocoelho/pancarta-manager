import { z } from 'zod'

function parseBRDate(val: string): boolean {
  const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false
  const [, d, m, y] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return (
    date.getFullYear() === Number(y) &&
    date.getMonth() === Number(m) - 1 &&
    date.getDate() === Number(d)
  )
}

export const csvPosterRowSchema = z.object({
  descricao_produto: z.string().min(1, 'Descrição obrigatória'),
  preco_loja: z.string().min(1, 'Preço loja obrigatório'),
  preco_app_site: z.string().min(1, 'Preço APP/SITE obrigatório'),
  ean: z.string().min(1, 'EAN obrigatório').regex(/^\d+$/, 'EAN deve ser numérico'),
  codigo_produto: z.string().min(1, 'Código do produto obrigatório'),
  data_validade: z
    .string()
    .min(1, 'Data de validade obrigatória')
    .refine(parseBRDate, 'Data inválida (use DD/MM/AAAA)'),
  canal_oferta: z.string().min(1, 'Canal da oferta obrigatório'),
  formato: z.enum(['A4', 'A6'] as const, { error: 'Formato deve ser A4 ou A6' }),
  loja: z.string().optional(),
  campanha: z.string().optional(),
  observacoes: z.string().optional(),
})

export const csvUserRowSchema = z.object({
  matricula: z.string().min(1, 'Matrícula obrigatória'),
  nome: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  loja: z.string().optional(),
  regional: z.string().optional(),
  perfil: z.enum(['ADMIN', 'AREA_CENTRAL', 'LOJA'] as const, {
    error: 'Perfil inválido (use ADMIN, AREA_CENTRAL ou LOJA)',
  }),
  status: z.enum(['ATIVO', 'INATIVO'] as const).optional().default('ATIVO'),
})

export const MAX_CSV_ROWS = 200
