-- CreateEnum
CREATE TYPE "UserProfile" AS ENUM ('ADMIN', 'AREA_CENTRAL', 'LOJA');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "PosterStatus" AS ENUM ('RASCUNHO', 'AGUARDANDO_CONFERENCIA', 'APROVADA_PELA_LOJA', 'PDF_GERADO', 'DOWNLOAD_REALIZADO', 'EXPIRADA', 'CANCELADA', 'ERRO_VALIDACAO');

-- CreateEnum
CREATE TYPE "PosterOrigin" AS ENUM ('MANUAL', 'CSV');

-- CreateEnum
CREATE TYPE "PosterFormat" AS ENUM ('A4', 'A6');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "PdfStatus" AS ENUM ('DISPONIVEL', 'EXPIRADO', 'ERRO');

-- CreateEnum
CREATE TYPE "CsvImportType" AS ENUM ('PANCARTAS', 'USUARIOS');

-- CreateEnum
CREATE TYPE "CsvImportStatus" AS ENUM ('PROCESSANDO', 'CONCLUIDO', 'ERRO', 'PARCIAL');

-- CreateEnum
CREATE TYPE "PdfGenerationMode" AS ENUM ('SINGLE_MULTIPAGE', 'INDIVIDUAL_FILES', 'ZIP_INDIVIDUAL_FILES');

-- CreateTable
CREATE TABLE "Regional" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Regional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "regional_id" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "senha_hash" TEXT NOT NULL,
    "perfil" "UserProfile" NOT NULL,
    "loja_id" TEXT,
    "regional_id" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "primeiro_acesso" BOOLEAN NOT NULL DEFAULT true,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "ultimo_login_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "formato" "PosterFormat" NOT NULL,
    "arquivo_base" TEXT NOT NULL,
    "versao" TEXT NOT NULL DEFAULT '1.0',
    "status" "TemplateStatus" NOT NULL DEFAULT 'ATIVO',
    "configuracao_posicoes" JSONB NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poster" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "loja_id" TEXT,
    "campanha" TEXT,
    "descricao_produto" TEXT NOT NULL,
    "preco_loja" TEXT NOT NULL,
    "preco_app_site" TEXT NOT NULL,
    "ean" TEXT NOT NULL,
    "codigo_produto" TEXT NOT NULL,
    "data_validade" TEXT NOT NULL,
    "canal_oferta" TEXT NOT NULL,
    "texto_legal" TEXT NOT NULL,
    "observacoes" TEXT,
    "origem" "PosterOrigin" NOT NULL,
    "status" "PosterStatus" NOT NULL DEFAULT 'RASCUNHO',
    "criado_por" TEXT NOT NULL,
    "aprovado_por" TEXT,
    "aprovado_em" TIMESTAMP(3),
    "pdf_id" TEXT,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsvImport" (
    "id" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "tipo" "CsvImportType" NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "loja_id" TEXT,
    "total_linhas" INTEGER NOT NULL DEFAULT 0,
    "linhas_validas" INTEGER NOT NULL DEFAULT 0,
    "linhas_invalidas" INTEGER NOT NULL DEFAULT 0,
    "status" "CsvImportStatus" NOT NULL DEFAULT 'PROCESSANDO',
    "erros" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CsvImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfFile" (
    "id" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "modo_geracao" "PdfGenerationMode" NOT NULL DEFAULT 'SINGLE_MULTIPAGE',
    "gerado_por" TEXT NOT NULL,
    "gerado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "status" "PdfStatus" NOT NULL DEFAULT 'DISPONIVEL',

    CONSTRAINT "PdfFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadLog" (
    "id" TEXT NOT NULL,
    "pdf_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "loja_id" TEXT,
    "baixado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "DownloadLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "matricula" TEXT,
    "perfil" TEXT,
    "loja_id" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT,
    "dados_anteriores" JSONB,
    "dados_novos" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "atualizado_por" TEXT,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_codigo_key" ON "Store"("codigo");

-- CreateIndex
CREATE INDEX "Store_status_idx" ON "Store"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricula_key" ON "User"("matricula");

-- CreateIndex
CREATE INDEX "User_matricula_idx" ON "User"("matricula");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_loja_id_idx" ON "User"("loja_id");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "PasswordResetToken_user_id_idx" ON "PasswordResetToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Template_formato_status_key" ON "Template"("formato", "status");

-- CreateIndex
CREATE INDEX "Poster_loja_id_idx" ON "Poster"("loja_id");

-- CreateIndex
CREATE INDEX "Poster_status_idx" ON "Poster"("status");

-- CreateIndex
CREATE INDEX "Poster_ean_idx" ON "Poster"("ean");

-- CreateIndex
CREATE INDEX "Poster_codigo_produto_idx" ON "Poster"("codigo_produto");

-- CreateIndex
CREATE INDEX "Poster_criado_em_idx" ON "Poster"("criado_em");

-- CreateIndex
CREATE INDEX "Poster_expira_em_idx" ON "Poster"("expira_em");

-- CreateIndex
CREATE INDEX "CsvImport_usuario_id_idx" ON "CsvImport"("usuario_id");

-- CreateIndex
CREATE INDEX "CsvImport_loja_id_idx" ON "CsvImport"("loja_id");

-- CreateIndex
CREATE INDEX "PdfFile_expira_em_idx" ON "PdfFile"("expira_em");

-- CreateIndex
CREATE INDEX "PdfFile_status_idx" ON "PdfFile"("status");

-- CreateIndex
CREATE INDEX "DownloadLog_pdf_id_idx" ON "DownloadLog"("pdf_id");

-- CreateIndex
CREATE INDEX "DownloadLog_usuario_id_idx" ON "DownloadLog"("usuario_id");

-- CreateIndex
CREATE INDEX "AuditLog_usuario_id_idx" ON "AuditLog"("usuario_id");

-- CreateIndex
CREATE INDEX "AuditLog_loja_id_idx" ON "AuditLog"("loja_id");

-- CreateIndex
CREATE INDEX "AuditLog_criado_em_idx" ON "AuditLog"("criado_em");

-- CreateIndex
CREATE INDEX "AuditLog_acao_idx" ON "AuditLog"("acao");

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_chave_key" ON "AppConfig"("chave");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_regional_id_fkey" FOREIGN KEY ("regional_id") REFERENCES "Regional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_regional_id_fkey" FOREIGN KEY ("regional_id") REFERENCES "Regional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_aprovado_por_fkey" FOREIGN KEY ("aprovado_por") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_pdf_id_fkey" FOREIGN KEY ("pdf_id") REFERENCES "PdfFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsvImport" ADD CONSTRAINT "CsvImport_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsvImport" ADD CONSTRAINT "CsvImport_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfFile" ADD CONSTRAINT "PdfFile_gerado_por_fkey" FOREIGN KEY ("gerado_por") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadLog" ADD CONSTRAINT "DownloadLog_pdf_id_fkey" FOREIGN KEY ("pdf_id") REFERENCES "PdfFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadLog" ADD CONSTRAINT "DownloadLog_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadLog" ADD CONSTRAINT "DownloadLog_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppConfig" ADD CONSTRAINT "AppConfig_atualizado_por_fkey" FOREIGN KEY ("atualizado_por") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
