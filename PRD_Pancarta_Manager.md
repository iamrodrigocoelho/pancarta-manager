# PRD — Pancarta Manager

## 1. Contexto

O Pancarta Manager será uma aplicação web responsiva responsável por criar, revisar, aprovar, gerar e imprimir pancartas promocionais nos formatos A4 e A6 para uso nas lojas.

A aplicação será utilizada por todas as lojas e também por áreas centrais, como Marketing, Comercial, Pricing, Operações e Tecnologia.

O objetivo é substituir o preenchimento manual em arquivos de imagem, apresentações ou modelos editáveis, garantindo padronização visual, redução de erros operacionais e maior controle sobre os materiais impressos nas lojas.

Os templates visuais oficiais serão fornecidos em arquivos PNG:

- `PANCARTA APP DAY_A4.png`
- `PANCARTA APP DAY_A6.png`

Esses arquivos já possuem os elementos fixos da comunicação, incluindo marca Venancio, App Day, VClube, QR Code, cores, cabeçalho e áreas visuais. A aplicação deve apenas inserir os dados dinâmicos sobre o template.

---

## 2. Objetivo do produto

Criar uma aplicação web chamada Pancarta Manager para permitir que lojas e áreas centrais criem pancartas promocionais padronizadas, preenchendo dados manualmente ou por upload de CSV, com pré-visualização, conferência, geração de PDF e controle de histórico por 2 dias.

---

## 3. Problema a ser resolvido

As lojas possuem dificuldade para preencher corretamente pancartas promocionais, especialmente em relação a:

- Descrição do produto.
- Preço de loja.
- Preço APP/SITE.
- Tamanho correto das fontes.
- Posicionamento dos textos.
- Texto legal.
- EAN.
- Código do produto.
- Padronização visual.
- Geração correta para impressão.
- Conferência antes da impressão.

A aplicação deve reduzir erros manuais e garantir que todas as pancartas sigam o padrão visual oficial.

---

## 4. Público-alvo

### Usuários de loja

- Gerentes de loja.
- Subgerentes.
- Operadores administrativos.
- Colaboradores autorizados a gerar pancartas.

### Usuários da área central

- Marketing.
- Comercial.
- Pricing.
- Operações.
- Tecnologia.

### Usuários administradores

- Administrador do sistema.
- Usuários responsáveis por cadastrar acessos, importar usuários em massa, configurar permissões e gerenciar parâmetros da aplicação.

---

## 5. Escopo do MVP

O MVP deve contemplar:

- Login próprio com matrícula e senha.
- Troca obrigatória de senha no primeiro acesso.
- Recuperação de senha por e-mail.
- Reset de senha pelo administrador.
- Cadastro individual de usuários.
- Cadastro massivo de usuários via CSV pelo administrador.
- Controle de perfis de acesso.
- Seleção de template A4 ou A6.
- Criação manual de pancartas.
- Criação em lote via upload de CSV.
- Limite de 200 linhas por CSV.
- Validação dos dados importados.
- Correção manual de dados antes da geração.
- Pré-visualização da pancarta.
- Aprovação/conferência pela própria loja.
- Geração de PDF após aprovação.
- Geração inicial em arquivo único com múltiplas páginas.
- Configuração futura para gerar PDFs individuais.
- Download e impressão do PDF.
- Registro de quem gerou o PDF.
- Registro de quem fez download do PDF.
- Retenção de histórico e PDFs por 2 dias.
- Restrição para que a loja visualize apenas suas próprias pancartas.
- Aplicação responsiva para smartphones, tablets, notebooks e desktops.
- Suporte mínimo a 200 usuários simultâneos.

---

## 6. Fora do escopo do MVP

Não fazem parte do MVP:

- Integração automática com ERP.
- Integração automática com sistema de pricing.
- Integração automática com cadastro de produtos.
- Integração direta com impressoras locais.
- SSO com Microsoft Entra ID ou Google Workspace.
- Customização de cores por campanha.
- Alteração do QR Code por campanha.
- Workflow de aprovação externo obrigatório.
- Aprovação por Marketing, Comercial, Pricing ou Regional.
- Armazenamento de histórico por mais de 2 dias.
- Motor avançado de campanhas.
- Leitura de arquivos Excel no MVP.
- Geração automática de campanhas a partir de sistemas externos.

---

## 7. Perfis de acesso

### Administrador

Permissões:

- Criar usuários individualmente.
- Criar usuários em massa via CSV.
- Editar dados de usuários.
- Ativar usuários.
- Desativar usuários.
- Resetar senha de usuários.
- Configurar perfis.
- Visualizar histórico geral dentro do período de retenção.
- Visualizar pancartas de todas as lojas.
- Configurar o modo de geração de PDF.
- Configurar parâmetros gerais do sistema.

### Área central

Perfis possíveis:

- Marketing.
- Comercial.
- Pricing.
- Operações.
- Tecnologia.

Permissões:

- Criar pancartas manualmente.
- Importar CSV.
- Gerar PDF sem necessidade de aprovação pela loja.
- Visualizar pancartas conforme escopo autorizado.
- Criar pancartas para uma ou mais lojas, caso o perfil permita.
- Visualizar histórico dentro do período de retenção.

### Loja

Permissões:

- Criar pancartas manualmente.
- Importar CSV, caso habilitado para o perfil.
- Visualizar prévia da pancarta.
- Aprovar/conferir a própria pancarta.
- Gerar PDF após aprovação.
- Baixar PDF.
- Imprimir PDF.
- Visualizar apenas pancartas da própria loja.
- Visualizar apenas histórico da própria loja dentro do período de retenção.

---

## 8. Autenticação

A autenticação será própria da aplicação.

### Login

Campos obrigatórios:

- Matrícula.
- Senha.

### Primeiro acesso

Regras:

- Todo usuário deverá alterar a senha no primeiro acesso.
- O sistema não deve permitir uso da aplicação antes da troca de senha.
- A senha inicial poderá ser temporária.
- A senha temporária poderá ser definida pelo administrador ou gerada automaticamente.

### Política mínima de senha

A senha deve conter:

- Mínimo de 8 caracteres.
- Pelo menos uma letra maiúscula.
- Pelo menos uma letra minúscula.
- Pelo menos um número.
- Pelo menos um caractere especial.

### Segurança de login

O sistema deve possuir:

- Bloqueio temporário após múltiplas tentativas inválidas.
- Registro de falhas de login.
- Expiração de sessão após período de inatividade.
- Hash forte de senha.
- Proteção contra brute force.
- Rate limit no endpoint de login.

---

## 9. Recuperação e reset de senha

### Reset pelo administrador

O administrador poderá resetar a senha de qualquer usuário.

Fluxo:

1. Administrador acessa o cadastro do usuário.
2. Seleciona a opção de reset de senha.
3. O sistema gera uma senha temporária ou link de redefinição.
4. O usuário deverá alterar a senha no próximo acesso.
5. A ação deve ser registrada em auditoria.

### Recuperação pelo usuário

O usuário poderá recuperar a senha sozinho caso tenha e-mail cadastrado na plataforma.

Fluxo:

1. Usuário clica em "Esqueci minha senha".
2. Informa matrícula ou e-mail.
3. O sistema verifica se existe e-mail cadastrado.
4. O sistema envia um link seguro de redefinição.
5. O link deve ter expiração.
6. O usuário cadastra nova senha.
7. A ação deve ser registrada em auditoria.

Regra:

- Usuários sem e-mail cadastrado devem solicitar reset ao administrador.

---

## 10. Gestão de usuários

O sistema deve permitir cadastro individual e cadastro massivo de usuários.

### Cadastro individual

Campos obrigatórios:

- Matrícula.
- Nome.
- Perfil.
- Loja.
- Status.

Campos opcionais:

- E-mail.
- Regional.
- Telefone.

### Cadastro massivo de usuários

O administrador poderá importar usuários via CSV.

Modelo sugerido:

```csv
matricula,nome,email,loja,regional,perfil,status
12345,João Silva,joao.silva@empresa.com,001,RJ,LOJA,ATIVO
```

Validações:

- Matrícula obrigatória.
- Nome obrigatório.
- Perfil obrigatório.
- Loja obrigatória para perfil de loja.
- E-mail deve ser válido quando preenchido.
- Não permitir matrícula duplicada.
- Informar linhas inválidas antes de concluir a importação.
- Permitir baixar modelo padrão de CSV.

---

## 11. Templates

A aplicação usará templates oficiais em PNG.

Templates iniciais:

- A4: `PANCARTA APP DAY_A4.png`
- A6: `PANCARTA APP DAY_A6.png`

Os templates conterão elementos fixos:

- Marca Venancio.
- App Day.
- VClube.
- QR Code.
- Cabeçalho.
- Cores institucionais.
- Área branca para dados do produto.
- Área amarela para preço promocional.
- Área inferior para texto legal.

O usuário não poderá alterar:

- Cor.
- Logo.
- QR Code.
- Cabeçalho.
- Estrutura visual.
- Background.
- Elementos fixos do template.

---

## 12. Campos dinâmicos da pancarta

A aplicação deve inserir dinamicamente os seguintes campos sobre o template:

- Descrição do produto.
- Preço loja.
- Preço APP/SITE.
- Data de validade da promoção.
- Canal da oferta.
- EAN.
- Código do produto.
- Texto legal gerado automaticamente.

---

## 13. Regras visuais

A pancarta deve respeitar as regras visuais do template fornecido.

Regras:

- Fonte padrão: Aptos.
- Descrição do produto na área branca superior.
- Preço loja na área branca.
- Preço APP/SITE em destaque na área amarela.
- Texto legal na parte inferior.
- EAN e código do produto no texto legal.
- Preço loja e preço APP/SITE devem seguir proporção visual padronizada.
- O sistema deve evitar que textos ultrapassem os limites das áreas definidas.
- O sistema deve ajustar quebra de linha da descrição do produto.
- O sistema deve preservar a proporção de impressão do A4 e do A6.
- O sistema deve gerar prévia fiel ao PDF final.

Tamanhos de referência baseados no modelo:

- Descrição do produto: aproximadamente 26.
- Preço loja: aproximadamente 26.
- Preço APP/SITE: aproximadamente 80.
- Texto legal: aproximadamente 11.

Observação:

- Os tamanhos podem ser parametrizados internamente para cada template, desde que o resultado visual respeite os modelos oficiais.

---

## 14. Criação manual de pancarta

O usuário poderá criar uma pancarta manualmente pela interface.

Campos obrigatórios:

- Formato: A4 ou A6.
- Descrição do produto.
- Preço loja.
- Preço APP/SITE.
- EAN.
- Código do produto.
- Data de validade da promoção.
- Canal da oferta.

Campos gerados automaticamente:

- Texto legal.

Campos opcionais:

- Campanha.
- Observações internas.

Fluxo:

1. Usuário acessa a aplicação.
2. Seleciona "Nova pancarta".
3. Escolhe o formato A4 ou A6.
4. Preenche os campos obrigatórios.
5. O sistema gera pré-visualização.
6. O usuário revisa os dados.
7. Se o usuário for loja, deve aprovar/conferir a própria pancarta.
8. O sistema libera geração de PDF.
9. O usuário gera o PDF.
10. O usuário baixa ou imprime o PDF.

---

## 15. Criação por CSV

A aplicação deve permitir upload de CSV para criação em lote.

O CSV poderá ser enviado por:

- Usuário de loja.
- Usuário da área central.
- Administrador.

### Limite

- Máximo de 200 linhas por arquivo CSV.
- Arquivos com mais de 200 linhas devem ser recusados.
- O sistema deve informar claramente o motivo da recusa.

### Campos mínimos do CSV

```csv
descricao_produto,preco_loja,preco_app_site,ean,codigo_produto,data_validade,canal_oferta,formato,loja,campanha
```

### Exemplo

```csv
descricao_produto,preco_loja,preco_app_site,ean,codigo_produto,data_validade,canal_oferta,formato,loja,campanha
"Suplemento Alimentar Nestlé Nutren Protein Baunilha 800g","162,99","99,90","7891000093326","1234","27/06/2026","APP e SITE","A4","001","APP DAY"
```

### Validações obrigatórias

O sistema deve validar:

- Arquivo no formato `.csv`.
- Máximo de 200 linhas.
- Descrição do produto preenchida.
- Preço loja preenchido.
- Preço APP/SITE preenchido.
- EAN preenchido.
- EAN numérico.
- Código do produto preenchido.
- Data de validade preenchida.
- Data em formato válido.
- Canal da oferta preenchido.
- Formato preenchido.
- Formato deve ser A4 ou A6.
- Loja válida, quando aplicável.

### Tratamento de erros

O sistema deve:

- Exibir linhas válidas e inválidas.
- Exibir o motivo do erro por linha.
- Permitir corrigir manualmente dados importados.
- Permitir remover linhas inválidas.
- Não gerar pancartas com campos obrigatórios inválidos.
- Permitir baixar modelo padrão de CSV.

---

## 16. Texto legal

O texto legal será sempre automático.

O usuário não poderá editar o texto legal manualmente.

O texto legal deverá ser gerado com base em:

- Data de validade.
- Canal da oferta.
- EAN.
- Código do produto.

Modelo sugerido:

```text
Promoção válida até {data_validade}. Oferta exclusiva {canal_oferta}, enquanto durarem os estoques. EAN: {ean} | CÓD: {codigo_produto}
```

Exemplo:

```text
Promoção válida até 27/06/2026. Oferta exclusiva APP e SITE, enquanto durarem os estoques. EAN: 7891000093326 | CÓD: 1234
```

Regra:

- Na criação manual, a data de validade será informada no formulário.
- Na criação via CSV, a data de validade virá no arquivo.
- O texto legal será renderizado automaticamente no rodapé da pancarta.

---

## 17. Aprovação/conferência pela loja

A aprovação será obrigatória apenas para pancartas criadas por usuários com perfil de loja.

A própria loja poderá aprovar a pancarta que criou.

Essa aprovação deve funcionar como etapa formal de conferência antes da geração do PDF.

### Regras

- Pancartas criadas por loja exigem aprovação/conferência.
- A própria loja pode aprovar a pancarta.
- A aprovação deve ser registrada em auditoria.
- Mesmo que o usuário que criou seja o mesmo que aprovou, os eventos devem ser registrados separadamente.
- Após aprovação, o PDF será liberado.
- Antes da aprovação, a loja não poderá gerar PDF.
- Pancartas criadas por área central podem seguir diretamente para geração de PDF, conforme permissão do perfil.

### Fluxo para criação manual pela loja

1. Loja cria pancarta.
2. Sistema exibe prévia.
3. Loja revisa informações.
4. Loja clica em "Aprovar e gerar PDF" ou ação equivalente.
5. Sistema registra aprovação.
6. Sistema libera geração do PDF.
7. Loja baixa ou imprime.

### Fluxo para CSV enviado pela loja

1. Loja envia CSV.
2. Sistema valida dados.
3. Sistema exibe erros, se houver.
4. Loja corrige ou remove linhas inválidas.
5. Sistema gera prévias.
6. Loja revisa o lote.
7. Loja aprova o lote.
8. Sistema gera PDF único com múltiplas páginas.
9. Loja baixa ou imprime.

---

## 18. Status das pancartas

Status possíveis:

- RASCUNHO
- AGUARDANDO_CONFERENCIA
- APROVADA_PELA_LOJA
- PDF_GERADO
- DOWNLOAD_REALIZADO
- EXPIRADA
- CANCELADA
- ERRO_VALIDACAO

Regras:

- RASCUNHO: pancarta criada, mas ainda não aprovada/conferida.
- AGUARDANDO_CONFERENCIA: pancarta criada por loja aguardando aprovação da própria loja.
- APROVADA_PELA_LOJA: loja confirmou que os dados estão corretos.
- PDF_GERADO: PDF foi gerado.
- DOWNLOAD_REALIZADO: pelo menos um download foi realizado.
- EXPIRADA: pancarta ultrapassou prazo de retenção de 2 dias.
- CANCELADA: pancarta cancelada pelo usuário autorizado.
- ERRO_VALIDACAO: houve erro nos dados enviados.

---

## 19. Geração de PDF

Após a aprovação/conferência, o sistema deverá gerar PDF.

### Regra inicial

No MVP, o sistema deverá gerar um único arquivo PDF com múltiplas páginas quando houver mais de uma pancarta.

### Configuração futura pelo admin

O sistema deve ser projetado para permitir que o administrador configure o modo de geração:

- PDF único com múltiplas páginas.
- Um PDF individual por pancarta.
- Pacote ZIP contendo PDFs individuais.

### Requisitos do PDF

- Deve preservar o layout oficial.
- Deve usar o PNG oficial como base.
- Deve inserir textos nas posições corretas.
- Deve respeitar formato A4 ou A6.
- Deve estar pronto para impressão.
- Deve ter boa qualidade visual.
- Deve registrar quem gerou.
- Deve registrar quem baixou.

### Nome sugerido para PDF individual

```text
pancarta_{ean}_{codigo_produto}_{formato}_{data_validade}.pdf
```

### Nome sugerido para PDF em lote

```text
pancartas_{loja}_{campanha}_{data_geracao}.pdf
```

---

## 20. Retenção de histórico e arquivos

A retenção será de 2 dias.

### Regras

- PDFs ficam disponíveis por 2 dias.
- Histórico da pancarta fica disponível por 2 dias.
- Após 2 dias, os registros devem ser expirados.
- Após 2 dias, os PDFs devem ser excluídos automaticamente.
- Pancartas expiradas não devem aparecer para usuários de loja.
- A exclusão automática deve ser registrada em log técnico.

---

## 21. Visibilidade e segregação por loja

Usuários de loja só podem visualizar dados da própria loja.

### Regras

- Loja não visualiza pancartas de outras lojas.
- Loja não visualiza uploads de outras lojas.
- Loja não visualiza histórico de outras lojas.
- Loja não visualiza usuários de outras lojas.
- A restrição deve ser feita no backend e não apenas na interface.
- Administrador pode visualizar todas as lojas.
- Área central pode visualizar lojas conforme permissão do perfil.

---

## 22. Auditoria

O sistema deve registrar eventos relevantes.

### Eventos obrigatórios

- Login.
- Falha de login.
- Logout.
- Troca de senha no primeiro acesso.
- Recuperação de senha.
- Reset de senha pelo administrador.
- Criação de usuário.
- Edição de usuário.
- Ativação de usuário.
- Desativação de usuário.
- Importação massiva de usuários.
- Criação manual de pancarta.
- Upload de CSV de pancartas.
- Correção de dados importados.
- Aprovação/conferência pela loja.
- Geração de PDF.
- Download de PDF.
- Cancelamento de pancarta.
- Expiração automática.
- Exclusão automática de PDF após 2 dias.

### Dados mínimos do log

- ID do evento.
- Usuário.
- Matrícula.
- Perfil.
- Loja.
- Ação.
- Entidade afetada.
- ID da entidade.
- Data e hora.
- IP.
- User agent.
- Dados anteriores, quando aplicável.
- Dados novos, quando aplicável.

---

## 23. Requisitos não funcionais

### Escalabilidade

A aplicação deve suportar pelo menos 200 usuários simultâneos.

Recomendações técnicas:

- Backend stateless.
- Possibilidade de escalar horizontalmente.
- Banco de dados relacional com índices adequados.
- Fila para geração de PDFs em lote.
- Processamento assíncrono para operações pesadas.
- Storage externo para PDFs.
- Cache para templates e configurações.
- Rate limit em endpoints sensíveis.

### Performance

Metas:

- Carregamento inicial em até 3 segundos.
- Pré-visualização individual em até 2 segundos.
- Geração de PDF individual em até 5 segundos.
- Processamento de CSV com até 200 linhas em até 30 segundos.
- Login em até 2 segundos.
- Listagem de histórico em até 2 segundos.
- Disponibilidade mínima recomendada de 99,5%.

### Responsividade

A aplicação deve funcionar corretamente em:

- Smartphones.
- Tablets.
- Notebooks.
- Desktops.

Diretrizes:

- Design mobile-first.
- Campos grandes e fáceis de preencher.
- Botões com área adequada para toque.
- Pré-visualização adaptável.
- Possibilidade de zoom na prévia.
- Tabelas responsivas.
- Interface compatível com navegadores modernos.

### Acessibilidade

Requisitos mínimos:

- Labels em todos os campos.
- Mensagens de erro claras.
- Contraste adequado.
- Navegação por teclado.
- Suporte a leitores de tela.
- Botões com textos objetivos.
- Não depender apenas de cor para indicar erro ou status.
- Inputs com máscaras e instruções claras.

---

## 24. Segurança

A aplicação deve seguir boas práticas de segurança web.

### Requisitos obrigatórios

- HTTPS obrigatório.
- Senhas armazenadas com hash forte.
- Validação server-side de todos os dados.
- Sanitização de entradas.
- Proteção contra XSS.
- Proteção contra CSRF.
- Proteção contra SQL Injection.
- Proteção contra upload malicioso.
- Upload restrito a arquivos `.csv`.
- Limite de tamanho de arquivo.
- Limite de 200 linhas por CSV.
- Rate limit em login.
- Rate limit em upload.
- Rate limit em geração de PDF.
- Controle de acesso por perfil.
- Restrição por loja no backend.
- Não expor PDFs publicamente sem autorização.
- Links de PDF devem expirar.
- Logs de auditoria.
- Separação entre ambientes de desenvolvimento, homologação e produção.

---

## 25. Observabilidade

O sistema deve possuir logs, métricas e rastreabilidade.

### Métricas recomendadas

- Quantidade de pancartas criadas por dia.
- Quantidade de pancartas por loja.
- Quantidade de pancartas por campanha.
- Quantidade de pancartas criadas manualmente.
- Quantidade de pancartas criadas por CSV.
- Taxa de erro no upload de CSV.
- Tempo médio de validação do CSV.
- Tempo médio de geração de PDF.
- Quantidade de downloads.
- Usuários ativos.
- Acessos simultâneos.
- Erros por endpoint.
- Falhas de login.
- Resets de senha.

### Logs técnicos

- Erros de API.
- Erros de validação.
- Erros de geração de PDF.
- Erros de upload.
- Falhas de envio de e-mail.
- Falhas de autenticação.
- Jobs de expiração e limpeza.

---

## 26. Modelo de dados sugerido

### User

Campos:

- id
- matricula
- nome
- email
- senha_hash
- perfil
- loja_id
- regional_id
- status
- primeiro_acesso
- ultimo_login_em
- criado_em
- atualizado_em

### Store

Campos:

- id
- codigo
- nome
- regional_id
- status
- criado_em
- atualizado_em

### Regional

Campos:

- id
- nome
- status
- criado_em
- atualizado_em

### Template

Campos:

- id
- nome
- formato
- arquivo_base
- versao
- status
- configuracao_posicoes
- criado_em
- atualizado_em

### Poster

Campos:

- id
- template_id
- loja_id
- campanha
- descricao_produto
- preco_loja
- preco_app_site
- ean
- codigo_produto
- data_validade
- canal_oferta
- texto_legal
- origem
- status
- criado_por
- aprovado_por
- aprovado_em
- pdf_id
- criado_em
- atualizado_em
- expira_em

### CsvImport

Campos:

- id
- nome_arquivo
- tipo
- usuario_id
- loja_id
- total_linhas
- linhas_validas
- linhas_invalidas
- status
- erros
- criado_em

### PdfFile

Campos:

- id
- nome_arquivo
- storage_url
- modo_geracao
- gerado_por
- gerado_em
- expira_em
- status

### DownloadLog

Campos:

- id
- pdf_id
- usuario_id
- loja_id
- baixado_em
- ip
- user_agent

### AuditLog

Campos:

- id
- usuario_id
- matricula
- perfil
- loja_id
- acao
- entidade
- entidade_id
- dados_anteriores
- dados_novos
- ip
- user_agent
- criado_em

### AppConfig

Campos:

- id
- chave
- valor
- descricao
- atualizado_por
- atualizado_em

---

## 27. Arquitetura sugerida

### Frontend

Sugestão:

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.

Módulos principais:

- Login.
- Primeiro acesso.
- Recuperação de senha.
- Dashboard.
- Gestão de usuários.
- Importação de usuários.
- Nova pancarta manual.
- Importação CSV de pancartas.
- Pré-visualização.
- Aprovação/conferência.
- Histórico.
- Administração.

### Backend

Sugestão:

- API em Node.js com TypeScript.
- Pode ser implementado com Next.js API routes, NestJS ou Express.
- Arquitetura modular.

Serviços principais:

- AuthService.
- UserService.
- StoreService.
- TemplateService.
- PosterService.
- CsvImportService.
- PdfService.
- AuditService.
- EmailService.
- CleanupService.

### Banco de dados

Sugestão:

- PostgreSQL.

Requisitos:

- Índices por matrícula.
- Índices por loja.
- Índices por status.
- Índices por data de criação.
- Índices por expiração.
- Índices por EAN.
- Índices por código do produto.

### Storage

Requisitos:

- Armazenar PDFs temporariamente.
- Permitir expiração em 2 dias.
- Controlar acesso aos arquivos.
- Não expor arquivos publicamente sem autorização.

### Fila e jobs

Recomenda-se usar fila para:

- Geração de PDFs em lote.
- Envio de e-mails.
- Limpeza de PDFs expirados.
- Expiração de históricos.

---

## 28. Telas principais

### Tela de login

Elementos:

- Campo matrícula.
- Campo senha.
- Botão entrar.
- Link "Esqueci minha senha".
- Mensagens de erro.

### Tela de primeiro acesso

Elementos:

- Senha atual ou temporária.
- Nova senha.
- Confirmação de nova senha.
- Regras de senha.
- Botão salvar.

### Dashboard

Elementos:

- Criar nova pancarta.
- Importar CSV.
- Histórico recente.
- Status das últimas pancartas.
- Atalhos administrativos, quando aplicável.

### Nova pancarta

Elementos:

- Seleção de formato A4 ou A6.
- Campos obrigatórios.
- Pré-visualização.
- Botão salvar rascunho.
- Botão aprovar/conferir.
- Botão gerar PDF, quando permitido.

### Upload CSV de pancartas

Elementos:

- Upload de arquivo.
- Download de modelo.
- Tabela de linhas importadas.
- Indicação de erros.
- Edição manual de linhas.
- Remoção de linhas inválidas.
- Pré-visualização do lote.
- Botão aprovar/conferir lote.
- Botão gerar PDF.

### Histórico

Elementos:

- Lista de pancartas dos últimos 2 dias.
- Filtros por status.
- Filtros por formato.
- Filtros por campanha.
- Filtros por loja para perfis autorizados.
- Link para PDF, quando disponível.
- Indicação de expiração.

### Administração de usuários

Elementos:

- Lista de usuários.
- Criar usuário.
- Editar usuário.
- Ativar/desativar usuário.
- Resetar senha.
- Importar usuários via CSV.

### Configurações

Elementos:

- Modo de geração de PDF.
- Limite de linhas por CSV.
- Tempo de retenção.
- Configurações de e-mail.
- Configurações gerais.

---

## 29. Critérios de aceite do MVP

O MVP será aceito quando:

- Usuário conseguir fazer login com matrícula e senha.
- Usuário for obrigado a trocar a senha no primeiro acesso.
- Usuário com e-mail cadastrado conseguir recuperar senha.
- Administrador conseguir resetar senha.
- Administrador conseguir criar usuário individualmente.
- Administrador conseguir importar usuários via CSV.
- Usuário conseguir selecionar template A4 ou A6.
- Usuário conseguir criar pancarta manualmente.
- Usuário conseguir importar CSV com até 200 linhas.
- Sistema bloquear CSV com mais de 200 linhas.
- Sistema validar campos obrigatórios.
- Sistema exibir linhas inválidas com motivo do erro.
- Sistema permitir correção manual de dados importados.
- Sistema gerar texto legal automaticamente.
- Usuário não conseguir editar texto legal.
- Usuário de loja conseguir aprovar/conferir a própria pancarta.
- Usuário de loja não conseguir gerar PDF antes da aprovação/conferência.
- Área central conseguir gerar PDF sem aprovação da loja, conforme permissão.
- Sistema gerar PDF com base no template A4.
- Sistema gerar PDF com base no template A6.
- Sistema gerar inicialmente PDF único com múltiplas páginas.
- Sistema registrar quem criou a pancarta.
- Sistema registrar quem aprovou/conferiu a pancarta.
- Sistema registrar quem gerou o PDF.
- Sistema registrar quem baixou o PDF.
- Usuário de loja visualizar apenas pancartas da própria loja.
- PDF ficar disponível por 2 dias.
- Histórico ficar disponível por 2 dias.
- Sistema expirar registros após 2 dias.
- Aplicação funcionar em smartphone, tablet, notebook e desktop.
- Aplicação suportar 200 usuários simultâneos em teste de carga.
- Aplicação seguir boas práticas mínimas de segurança.

---

## 30. Roadmap

### Fase 1 — MVP

- Login com matrícula e senha.
- Troca de senha no primeiro acesso.
- Recuperação de senha.
- Gestão de usuários.
- Importação massiva de usuários.
- Criação manual de pancartas.
- Upload CSV de pancartas.
- Validação de CSV.
- Pré-visualização.
- Aprovação/conferência pela loja.
- Geração de PDF A4 e A6.
- Histórico de 2 dias.
- Auditoria básica.

### Fase 2 — Governança

- Configuração avançada por loja.
- Restrição por regional.
- Restrição por grupo de lojas.
- Relatórios por loja.
- Relatórios por campanha.
- Dashboard de uso.
- Configuração de PDFs individuais ou ZIP.

### Fase 3 — Integrações

- Integração com cadastro de produtos.
- Integração com pricing.
- Consulta automática por EAN.
- Integração com ERP.
- Importação automática de campanhas.

### Fase 4 — Inteligência

- Detecção de inconsistência de preço.
- Sugestão de correção de dados.
- Alerta de campanha próxima do vencimento.
- Dashboard executivo.
- Comparativo de produtividade entre lojas.

---

## 31. Instruções para implementação no Claude Code

Ao implementar este projeto, siga as diretrizes abaixo:

1. Criar uma aplicação web responsiva com foco em uso por lojas.
2. Priorizar segurança, segregação por loja e auditabilidade.
3. Usar TypeScript em todo o projeto.
4. Criar componentes reutilizáveis para formulários, tabelas, pré-visualização e upload CSV.
5. Garantir validação client-side e server-side.
6. Nunca confiar apenas na validação do frontend.
7. Implementar RBAC para controle de perfis.
8. Implementar restrição por loja no backend.
9. Implementar geração de PDF fiel aos templates PNG.
10. Implementar logs de auditoria para ações sensíveis.
11. Implementar testes unitários para regras de negócio.
12. Implementar testes de integração para autenticação, CSV, aprovação e PDF.
13. Implementar rotina de expiração e limpeza de dados com mais de 2 dias.
14. Não permitir que usuários de loja acessem dados de outras lojas.
15. Não permitir edição manual do texto legal.
16. Não permitir upload de CSV acima de 200 linhas.
17. Não permitir geração de PDF por loja antes da aprovação/conferência.
18. Criar código limpo, modular e preparado para evolução futura.

---

## 32. Stack sugerida

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod

### Backend

- Next.js API Routes ou NestJS
- TypeScript
- Prisma ORM
- PostgreSQL

### PDF

- Biblioteca de geração de PDF que permita:
  - Usar imagem PNG como fundo.
  - Inserir textos em posições absolutas.
  - Controlar fonte, tamanho e alinhamento.
  - Gerar múltiplas páginas.

Sugestões:

- pdf-lib
- Puppeteer
- Playwright
- React PDF

A escolha deve considerar fidelidade visual ao template.

### Upload e CSV

- PapaParse ou biblioteca equivalente.
- Validação com Zod.
- Limite de 200 linhas.

### Segurança

- bcrypt ou argon2 para hash de senha.
- JWT ou sessão segura.
- Rate limit.
- CSRF protection, se aplicável.
- Sanitização de inputs.

### Testes

- Jest ou Vitest.
- Testing Library.
- Playwright para testes end-to-end.

---

## 33. Regras críticas que não podem ser violadas

- Loja não pode visualizar dados de outra loja.
- Loja não pode gerar PDF antes de aprovar/conferir a própria pancarta.
- Texto legal não pode ser editado manualmente.
- CSV não pode ter mais de 200 linhas.
- PDFs devem expirar em 2 dias.
- Histórico deve expirar em 2 dias.
- Quem gerou e quem baixou PDF devem ser registrados.
- Templates visuais não podem ser alterados pelo usuário.
- QR Code deve permanecer fixo no template.
- A aplicação deve suportar 200 usuários simultâneos.
