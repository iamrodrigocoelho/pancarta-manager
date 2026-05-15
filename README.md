# Pancarta Manager

Aplicação web para criação, conferência, aprovação, geração e download de pancartas promocionais em formatos A4 e A6.

## Requisitos

- Node.js 20+
- PostgreSQL 15+

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Gerar cliente Prisma
npm run db:generate

# Criar e migrar o banco
npm run db:migrate

# Popular com dados iniciais
npm run db:seed
```

## Iniciar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Usuários iniciais (seed)

| Matrícula | Senha | Perfil |
|---|---|---|
| admin | Admin@123 | ADMIN |
| central01 | Central@123 | AREA_CENTRAL |
| loja001 | Loja@123! | LOJA (Loja Centro) |

## Testes

```bash
# Testes unitários
npm test

# Testes em modo watch
npm run test:watch

# Testes E2E (requer app rodando)
npm run test:e2e
```

## Limpeza automática

PDFs e histórico expiram após 2 dias. A limpeza roda automaticamente a cada hora via `node-cron`.

Para rodar manualmente via API:

```bash
curl -X POST http://localhost:3000/api/cron/cleanup \
  -H "x-cron-secret: seu_cron_secret"
```

## Geração de PDF

PDFs gerados com `pdf-lib` usando templates PNG em `public/templates/` como fundo.
Posições de texto salvas em `Template.configuracao_posicoes` (JSON no banco).

> **Nota sobre fonte:** O sistema usa `Helvetica` como fallback para `Aptos`. Para usar Aptos, adicione o arquivo `.ttf` em `public/fonts/` e atualize `src/lib/pdf.ts`.

## Stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS v4**
- **Prisma** + **PostgreSQL** · **pdf-lib** · **PapaParse**
- **Argon2** · **jose** (JWT) · **Vitest** · **Playwright**
