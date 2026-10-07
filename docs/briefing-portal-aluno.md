# OpenSGA — briefing para desenhar o Portal do Aluno

Anexo para o modelo de design. **Não use swagger.** Este arquivo é o contrato de produto, dados e sistema visual.

Surpreenda na experiência. **Não desenhe um segundo painel administrativo.**

---

## O que anexar neste chat

1. **Este arquivo** (obrigatório).
2. **2–4 prints do Portal Administrativo** já existente — só como família visual (tipografia, navy, cards, badges). Não como layout a copiar.
   - Sidebar com monograma Ω + OpenSGA
   - Um page header (eyebrow mono + título serif)
   - Uma tela com Card + Badge de status
3. **Nada de OpenAPI / swagger.json.** Ele descreve o ERP da secretaria e enviesa o desenho para CRUD.

---

## 1. O que é este produto

OpenSGA é um SGA para IES brasileiras. Três superfícies no mesmo app:

| Superfície | Para quem | Tom |
| :--- | :--- | :--- |
| Site institucional | visitante | marketing Nexa (slate/blue/emerald — **não use aqui**) |
| Portal administrativo | secretaria e docente | ERP operacional, tabelas, CRUD |
| **Portal do aluno** | aluno e responsável legal | **self-service pessoal — o que você vai desenhar** |

Login: `/login-aluno` (e-mail, CPF ou RA). Sessão JWT no cookie `auth_token`. Área: `/area-aluno`.

Hoje o portal do aluno é esqueleto (Início + “Notas e frequência”). Você está desenhando a primeira versão real.

---

## 2. Direção visual — a regra mais importante

**Mesma família. Outra alma.**

Herde do admin: fontes, tokens de cor, radius, shadcn, monograma Ω, período letivo, claro/escuro.

**Não herde:** cara de backoffice.

O admin é ferramenta de quem opera a IES (listas longas, filtros, diálogos de exclusão, ocupação de polo, conciliação Stripe institucional, auditoria MEC). O aluno abre o celular entre uma aula e outra para saber: *como estou neste semestre? tenho boleto atrasado? falta vai me reprovar?*

### Faça

- Portal pessoal, calmo, institucional — “meu semestre”, não “módulo acadêmico”
- Dashboard narrativo (saudação, próximo passo, risco, pendência)
- Cards e hierarquia emocional; tabela só no boletim, onde comparar AV / AVS / NS exige grade
- Densidade menor. Ar. Mobile first de verdade
- Linguagem humana: “Faltas em risco”, “AV3 liberada”, “Mensalidade em atraso”
- RESPONSÁVEL: tom de família / guarda do menor, não de operador

### Não faça

- Clonar sidebar de secretaria com outros rótulos
- Painel com 8 KPIs, funil de retenção, ocupação de campus, termômetro de extensão 10%
- Tabelas operacionais com paginação de 25/50, busca global, ações em lote
- Botões “Novo”, “Editar”, “Excluir”, planilhas, drawers de cadastro
- Cara de SaaS admin (Airtable, Stripe Dashboard, Metabase)
- Cara de e-learning infantil / gamificação / mascote
- Marca nova, Playfair, `emerald-*` / `sky-*` / `amber-*`, hex solto, `text-white` / `bg-black`

Se alguém confundir uma tela com a Secretaria, redesenhe.

---

## 3. Personas

### ALUNO

Titular. Vê só a própria vida acadêmica e financeira. Badge **ALUNO**. RA visível.

### RESPONSAVEL

Guarda de aluno menor. Mesmo login. Badge **RESPONSÁVEL**. Seletor de dependente se houver mais de um. Vê progresso, faturas e comunicados do dependente. Pode pagar boleto (URL Stripe). **Não lança nota, não fecha semestre, não edita matrícula, não vê outros alunos.**

`GET /auth/me` hoje devolve `aluno { id, ra }` só para o papel ALUNO. Responsável não tem bloco equivalente — desenhe o seletor e declare o dado que faltaria.

---

## 4. Mapa de telas

Shell `/area-aluno` — navegação curta, grupos humanos, não “módulos do ERP”.

**Início** `/area-aluno/dashboard`  
Saudação + nome + RA + período. 3–4 sinais pessoais (matrícula, risco de RF, fatura, AV3). Próxima ação. Cartões do semestre. Responsável: os mesmos sinais do dependente + financeiro em destaque. **Proibido** copiar os 4 gráficos da Secretaria.

**Notas e frequência** `/area-aluno/notas`  
Por disciplina: AV, AVS, NS, AV3 (se `habilitaAv3`), faltas, % frequência, status. Explicar a regra em linguagem clara (não regulamento cru). Empty / semestre aberto vs fechado.

**Meu curso**  
Grade do semestre / componentes da matriz — leitura, calendário mental, não auditoria MEC.

**Minha matrícula**  
RA, status, curso, modalidade, polo. Sem alterar ciclo.

**Faturas**  
Lista do próprio aluno. Badge de status. CTA “Pagar” só se existir `stripePaymentUrl`. R$ 0 / isenção sem fingir Checkout.

**Comunicados**  
Mural de leitura. Sem editor.

**Ouvidoria**  
Abrir e acompanhar o **próprio** protocolo. Sem fila da Ouvidoria Geral.

**Perfil e senha**  
Dados em leitura + trocar senha (primeiro acesso). Sem gestão de pessoas.

Estados em toda tela: loading (Skeleton), vazio, erro, primeiro acesso.

Mobile: dashboard + notas + faturas obrigatórios.

---

## 5. Dados que o desenho pode mostrar

Campos reais do domínio. Use os **rótulos em português**, não os enums crus na UI.

### Conta — `MeProfile`

`nome`, `email`, `cpf`, `avatarUrl`, `ativo`, `role`  
`aluno.id`, `aluno.ra` (só ALUNO)

Troca de senha: `senhaAtual`, `senhaNova`.

### Matrícula

`status` → Pré-matriculado | Ativo | Trancado | Cancelado | Formado | Evadido  
`periodoAtual`, `semestreIngresso`  
`curso.nome`, `curso.modalidade` → Presencial | Semipresencial | EAD  
`matrizCurricular.nome`, `matrizCurricular.anoVigencia`  
`aluno.ra`

### Diário (boletim)

`notaAv`, `notaAvs`, `notaAv3` (0–10, nullable)  
`notaSemestral` (NS) = **MAX(AV, AVS)** — nulos ignorados. **Nunca A1/A2/AF.**  
`mediaFinal` (MF) = (NS + AV3) / 2 quando couber  
`habilitaAv3` — true se frequência regular e NS < 6,0  
`totalFaltas`, `chTotal`, `chCumprida`  
`statusDisciplina` → Em aberto | Aprovado | Reprovado por falta (RF) | Reprovado por nota (RN)  
`semestreFechado`  
`turma.codigo`, `turma.disciplina`

Regras (mostre em tooltip / texto curto, não em jargão):

- RF é soberano: faltas > 25% da CH → RF, ignora notas, CH cumprida = 0
- NS ≥ 6 e frequência regular → aprovado no fechamento
- NS < 6 e frequência regular → AV3; aprovado se MF ≥ 5,0
- Semestre já fechado vs ainda em lançamento deve ficar óbvio

### Turma (contexto do aluno)

`codigo`, `anoLetivo`, `semestreLetivo`, `horario`, `salaOuLink`  
`tipoEntrega` → Presencial físico | Síncrono mediado | Assíncrono digital  
`disciplina.nome`, `disciplina.codigo`  
`professor.user.nome`

### Matriz (leitura)

`nome`, `anoVigencia`  
Componente: `semestreIdeal`, `tipo` (Core vida e carreira | Específico | Eletiva de trilha | Extensão | Optativo), `chTotal`, disciplina

### Fatura

`descricao`, `valor`, `dataVencimento`  
`status` → Pendente | Paga | Atrasada | Cancelada  
`stripePaymentUrl` (nullable), `pagoEm` (nullable)

Não mostre `stripeInvoiceId` / IDs internos.

### Comunicado

`titulo`, `conteudo`, `publicoAlvo` (filtrar ALUNO / RESPONSAVEL), `criadoEm`

### Ouvidoria — `Reclamacao`

`assunto`, `tipo` → Financeiro / cobrança | Coordenação pedagógica | Secretaria acadêmica | Infraestrutura & TI | Ouvidoria geral  
`descricao`, `resposta`, `status` → Aberto | Em análise | Respondido | Fechado  
`criadoEm`

Aluno/responsável só os **próprios** protocolos.

---

## 6. Sistema visual (herdar; não reinventar)

### Tipografia

| Uso | Fonte | classe |
| :--- | :--- | :--- |
| Corpo | Plus Jakarta Sans | `font-sans` |
| Títulos | Source Serif 4 + Newsreader, pilha `ui-serif, Georgia, Cambria, Times` | `font-heading` / `font-serif`, tracking `-0.015em` |
| RA, período, eyebrow | JetBrains Mono | `font-mono` |

Proibido: Playfair Display e serifada editorial de alto contraste.

### Tokens (claro / `.dark`) — só estes

Canvas: `background` (frio, ~210 20% 98%), `foreground`, `card`, `muted`, `border`, `input`, `ring`  
Ação: `primary` = **navy institucional** (não o azul elétrico do site)  
Sidebar: `sidebar`, `sidebar-foreground`, `sidebar-accent`, `sidebar-border`, `sidebar-primary` (Ω)  
Status: `success`, `warning`, `info`, `destructive` (+ `-foreground`)  
Gráficos pessoais, se houver: `chart-1` … `chart-5`

Tokens `nexa-*` são do site. Não use no portal do aluno.

### Shell (estrutura, não estética de ERP)

Pode manter sidebar esquerda + header — é o app. Mas:

- Subtítulo: **Portal do Aluno** (nunca “Portal Administrativo”)
- Nav curta, labels humanos, sem 12 itens de secretaria
- Header leve: breadcrumb curto, período, tema, avatar
- Page header: eyebrow mono → título serif → uma linha de contexto. Sem barra de “ações administrativas”
- Radius `--radius` 0.625rem. Ícones Lucide 16–20px

Mobile: drawer. Não espremer a tabela da secretaria.

### shadcn já no repo

Alert, AlertDialog, Avatar, Badge, Button, Card, Checkbox, Combobox, Dialog, DropdownMenu, Form, Input, InputGroup, Label, Select, Separator, Skeleton, Sonner, Table, Tabs, Textarea, Toggle, ToggleGroup.

Sempre `Button` do shadcn. Form = React Hook Form + Zod.

Padrões úteis: Badge de status, Card, Skeleton, Tabs, Avatar + DropdownMenu, Form na senha/ouvidoria.  
**Não** ancore a experiência em Table + paginação + Dialog de CRUD.

Se faltar Progress / Accordion / Sheet, use o shadcn — não invente kit.

---

## 7. Entrega

1. Shell ALUNO e variante RESPONSÁVEL (badge + seletor de dependente) — sem cara de admin
2. Início (“meu semestre”)
3. Notas e frequência
4. Meu curso
5. Minha matrícula
6. Faturas
7. Comunicados
8. Ouvidoria
9. Perfil e senha
10. Vazio + primeiro acesso
11. Mobile: shell, início, notas, faturas
12. Uma linha por tela: dado usado + papel + se é leitura

Teste mental: *isso parece secretaria com outro título?* Se sim, jogue fora e recomece pelo cartão pessoal do semestre.
