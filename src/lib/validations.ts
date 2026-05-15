import { z } from 'zod'

export const loginSchema = z.object({
  matricula: z.string().min(1, 'Matrícula obrigatória'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const passwordSchema = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .regex(/[A-Z]/, 'Pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Pelo menos um caractere especial')

export const firstAccessSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação obrigatória'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  matriculaOrEmail: z.string().min(1, 'Matrícula ou e-mail obrigatório'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

export const createUserSchema = z.object({
  matricula: z.string().min(1, 'Matrícula obrigatória'),
  nome: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  perfil: z.enum(['ADMIN', 'AREA_CENTRAL', 'LOJA'] as const),
  lojaId: z.string().optional(),
  regionalId: z.string().optional(),
  status: z.enum(['ATIVO', 'INATIVO'] as const).default('ATIVO'),
})

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().min(1),
})

export const createPosterSchema = z.object({
  templateId: z.string().min(1, 'Template obrigatório'),
  lojaId: z.string().optional(),
  campanha: z.string().optional(),
  descricaoProduto: z.string().min(1, 'Descrição obrigatória'),
  precoLoja: z.string().min(1, 'Preço loja obrigatório'),
  precoAppSite: z.string().min(1, 'Preço APP/SITE obrigatório'),
  ean: z.string().min(1, 'EAN obrigatório').regex(/^\d+$/, 'EAN deve ser numérico'),
  codigoProduto: z.string().min(1, 'Código do produto obrigatório'),
  dataValidade: z.string().min(1, 'Data de validade obrigatória'),
  canalOferta: z.string().min(1, 'Canal da oferta obrigatório'),
  observacoes: z.string().optional(),
  formato: z.enum(['A4', 'A6'] as const),
})

export const generatePdfSchema = z.object({
  posterIds: z.array(z.string()).min(1, 'Selecione ao menos uma pancarta'),
})

export const updateConfigSchema = z.object({
  chave: z.string().min(1),
  valor: z.string().min(1),
})

export const createStoreSchema = z.object({
  codigo: z.string().min(1, 'Código obrigatório'),
  nome: z.string().min(2, 'Nome obrigatório'),
  regionalId: z.string().optional(),
  status: z.enum(['ATIVO', 'INATIVO'] as const).default('ATIVO'),
})
