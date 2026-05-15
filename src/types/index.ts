import type {
  UserProfile,
  UserStatus,
  PosterStatus,
  PosterOrigin,
  PosterFormat,
  PdfGenerationMode,
} from '@prisma/client'

export type { UserProfile, UserStatus, PosterStatus, PosterOrigin, PosterFormat, PdfGenerationMode }

export interface SessionUser {
  id: string
  matricula: string
  nome: string
  perfil: UserProfile
  lojaId: string | null
  lojaCode: string | null
  lojaNome: string | null
  primeiroAcesso: boolean
}

export interface JWTPayload {
  sub: string
  matricula: string
  nome: string
  perfil: UserProfile
  lojaId: string | null
  lojaCode: string | null
  lojaNome: string | null
  primeiroAcesso: boolean
  iat: number
  exp: number
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface TemplatePositions {
  descricao: { x: number; y: number; maxWidth: number; fontSize: number }
  precoLoja: { x: number; y: number; fontSize: number }
  precoAppSite: { x: number; y: number; fontSize: number }
  textoLegal: { x: number; y: number; maxWidth: number; fontSize: number; lineHeight: number }
  pageWidth: number
  pageHeight: number
}

export interface CsvPosterRow {
  descricao_produto: string
  preco_loja: string
  preco_app_site: string
  ean: string
  codigo_produto: string
  data_validade: string
  canal_oferta: string
  formato: string
  loja?: string
  campanha?: string
  observacoes?: string
}

export interface CsvPosterRowValidated extends CsvPosterRow {
  _linha: number
  _valida: boolean
  _erros: string[]
}

export interface CsvUserRow {
  matricula: string
  nome: string
  email?: string
  loja?: string
  regional?: string
  perfil: string
  status?: string
}

export interface CsvUserRowValidated extends CsvUserRow {
  _linha: number
  _valida: boolean
  _erros: string[]
}

export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  FALHA_LOGIN: 'FALHA_LOGIN',
  LOGOUT: 'LOGOUT',
  TROCA_SENHA_PRIMEIRO_ACESSO: 'TROCA_SENHA_PRIMEIRO_ACESSO',
  RECUPERACAO_SENHA: 'RECUPERACAO_SENHA',
  RESET_SENHA_ADMIN: 'RESET_SENHA_ADMIN',
  CRIACAO_USUARIO: 'CRIACAO_USUARIO',
  EDICAO_USUARIO: 'EDICAO_USUARIO',
  ATIVACAO_USUARIO: 'ATIVACAO_USUARIO',
  DESATIVACAO_USUARIO: 'DESATIVACAO_USUARIO',
  IMPORTACAO_USUARIOS: 'IMPORTACAO_USUARIOS',
  CRIACAO_PANCARTA: 'CRIACAO_PANCARTA',
  EDICAO_PANCARTA: 'EDICAO_PANCARTA',
  UPLOAD_CSV_PANCARTAS: 'UPLOAD_CSV_PANCARTAS',
  CORRECAO_DADOS_CSV: 'CORRECAO_DADOS_CSV',
  APROVACAO_PANCARTA: 'APROVACAO_PANCARTA',
  GERACAO_PDF: 'GERACAO_PDF',
  DOWNLOAD_PDF: 'DOWNLOAD_PDF',
  CANCELAMENTO_PANCARTA: 'CANCELAMENTO_PANCARTA',
  EXPIRACAO_AUTOMATICA: 'EXPIRACAO_AUTOMATICA',
  EXCLUSAO_PDF: 'EXCLUSAO_PDF',
} as const

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS]
