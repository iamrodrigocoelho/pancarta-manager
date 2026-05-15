import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Regional
  const regional = await prisma.regional.upsert({
    where: { id: 'regional-rj' },
    update: {},
    create: { id: 'regional-rj', nome: 'Regional RJ', status: 'ATIVO' },
  })

  // Stores
  const store001 = await prisma.store.upsert({
    where: { codigo: '001' },
    update: {},
    create: { codigo: '001', nome: 'Loja Centro', regional_id: regional.id, status: 'ATIVO' },
  })

  const store002 = await prisma.store.upsert({
    where: { codigo: '002' },
    update: {},
    create: { codigo: '002', nome: 'Loja Barra', regional_id: regional.id, status: 'ATIVO' },
  })

  // Admin user
  const adminHash = await argon2.hash('Admin@123')
  await prisma.user.upsert({
    where: { matricula: 'admin' },
    update: {},
    create: {
      matricula: 'admin',
      nome: 'Administrador',
      email: 'admin@empresa.com',
      senha_hash: adminHash,
      perfil: 'ADMIN',
      status: 'ATIVO',
      primeiro_acesso: false,
    },
  })

  // Area central user
  const centralHash = await argon2.hash('Central@123')
  await prisma.user.upsert({
    where: { matricula: 'central01' },
    update: {},
    create: {
      matricula: 'central01',
      nome: 'Marketing Central',
      email: 'marketing@empresa.com',
      senha_hash: centralHash,
      perfil: 'AREA_CENTRAL',
      status: 'ATIVO',
      primeiro_acesso: false,
    },
  })

  // Loja user
  const lojaHash = await argon2.hash('Loja@123!')
  await prisma.user.upsert({
    where: { matricula: 'loja001' },
    update: {},
    create: {
      matricula: 'loja001',
      nome: 'Gerente Loja Centro',
      email: 'loja001@empresa.com',
      senha_hash: lojaHash,
      perfil: 'LOJA',
      loja_id: store001.id,
      status: 'ATIVO',
      primeiro_acesso: false,
    },
  })

  // Templates A4 and A6 with position config
  // Positions are in PDF points (1pt = 1/72 inch)
  // A4: 595 x 842 pt | A6: 298 x 420 pt
  // These coordinates are calibrated for the Venancio template layout

  const a4Positions = {
    pageWidth: 595,
    pageHeight: 842,
    descricao: { x: 40, y: 620, maxWidth: 515, fontSize: 22 },
    precoLoja: { x: 40, y: 560, fontSize: 22 },
    precoAppSite: { x: 40, y: 440, fontSize: 72 },
    textoLegal: { x: 40, y: 60, maxWidth: 515, fontSize: 9, lineHeight: 13 },
  }

  const a6Positions = {
    pageWidth: 298,
    pageHeight: 420,
    descricao: { x: 20, y: 310, maxWidth: 258, fontSize: 13 },
    precoLoja: { x: 20, y: 270, fontSize: 13 },
    precoAppSite: { x: 20, y: 190, fontSize: 40 },
    textoLegal: { x: 20, y: 30, maxWidth: 258, fontSize: 7, lineHeight: 10 },
  }

  await prisma.template.upsert({
    where: { id: 'tmpl-a4' },
    update: {},
    create: {
      id: 'tmpl-a4',
      nome: 'PANCARTA APP DAY A4',
      formato: 'A4',
      arquivo_base: 'A4.png',
      versao: '1.0',
      status: 'ATIVO',
      configuracao_posicoes: a4Positions,
    },
  })

  await prisma.template.upsert({
    where: { id: 'tmpl-a6' },
    update: {},
    create: {
      id: 'tmpl-a6',
      nome: 'PANCARTA APP DAY A6',
      formato: 'A6',
      arquivo_base: 'A6.png',
      versao: '1.0',
      status: 'ATIVO',
      configuracao_posicoes: a6Positions,
    },
  })

  // Default app configs
  const configs = [
    { chave: 'csv_max_rows', valor: '200', descricao: 'Limite de linhas por CSV' },
    { chave: 'retention_days', valor: '2', descricao: 'Dias de retenção de pancartas e PDFs' },
    { chave: 'pdf_generation_mode', valor: 'SINGLE_MULTIPAGE', descricao: 'Modo de geração de PDF' },
    { chave: 'password_reset_token_minutes', valor: '30', descricao: 'Validade do link de recuperação (minutos)' },
    { chave: 'session_timeout_minutes', valor: '480', descricao: 'Tempo de sessão (minutos)' },
    { chave: 'login_max_attempts', valor: '5', descricao: 'Tentativas de login antes do bloqueio' },
    { chave: 'lockout_minutes', valor: '15', descricao: 'Tempo de bloqueio após falhas de login' },
  ]

  for (const cfg of configs) {
    await prisma.appConfig.upsert({
      where: { chave: cfg.chave },
      update: {},
      create: cfg,
    })
  }

  console.log('Seed concluído!')
  console.log('Usuários criados:')
  console.log('  admin / Admin@123 (ADMIN)')
  console.log('  central01 / Central@123 (AREA_CENTRAL)')
  console.log('  loja001 / Loja@123! (LOJA - Loja Centro)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
