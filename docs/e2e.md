# Testes E2E (Playwright) — OpenSGA Frontend

| Campo | Valor |
| :---- | :---- |
| Versão | 1.1.0 |
| Data | 14/10/2026 |
| Escopo | Suíte Playwright deste repositório |
| Regras de negócio / Postman | [opensga-api/docs/qa-arquitetura-testes.md](https://github.com/luizengdev/opensga-api/blob/develop/docs/qa-arquitetura-testes.md) |

Este arquivo cobre **como** rodar o E2E no front e os **cenários BDD** já automatizados na suíte (seção 7), para consulta sem abrir o doc da API.

Fonte canônica de regras, CA e Postman: doc da API. Novo cenário Playwright = criar/atualizar o ID lá primeiro; depois espelhar o Gherkin aqui e implementar o `test('QA-…')`.

---

## 1. Arquitetura da suíte

```
┌────────────────────────────────────────────────────────────┐
│  Playwright (e2e/*.spec.ts)                                 │
│  baseURL http://localhost:3000                              │
├──────────────────────┬─────────────────────────────────────┤
│  Next (webServer)    │  Mock HTTP (e2e/mocks/)             │
│  API_BASE_URL=3334   │  mock-api-server.mjs :3334          │
└──────────────────────┴─────────────────────────────────────┘
```

- **Não** usa a API Fastify real nem Postgres no CI local padrão.
- Porta da API/Postman (`3333`) é independente do mock (`3334`).
- Isolamento: `resetMockApi()` no `beforeEach` + fixtures em `e2e/fixtures/test.ts`.
- Page Objects em `e2e/pages/`; helpers em `e2e/helpers/` (Allure `annotate`, reset).

---

## 2. Como rodar

```bash
npx playwright install chromium   # primeira vez

CI=true npm run test:e2e          # build + suíte
CI=true npx playwright test --reporter=list --retries=0
npm run test:e2e:ui               # UI Mode
npm run test:e2e:headed
npm run test:e2e:dev              # contra next dev (PLAYWRIGHT_WEB_SERVER=dev)
SLOW_MO=500 npm run test:e2e:headed   # desacelerar (opcional)
```

Portas ocupadas: `fuser -k 3000/tcp 3334/tcp`.

Filtros úteis:

```bash
npx playwright test --grep @p0
npx playwright test --grep @p1
npx playwright test e2e/inscricao.spec.ts
```

Relatórios: HTML (`playwright-report/`), Allure (`allure-results/` — epic/feature/severity via `annotate`).

---

## 3. Organização dos specs

| Prioridade | Tag no `describe` / título | Arquivos |
| :--------- | :------------------------- | :------- |
| P0 | `@p0` | `e2e/<dominio>.spec.ts` |
| P1 | `@p1` | `e2e/*-p1.spec.ts` (ou `describe` `@p1` no mesmo domínio) |

Convenção atual: P0 e P1 em arquivos separados por onda. Também é válido agrupar no mesmo arquivo com dois `describe` (`… @p0` / `… @p1`) — o filtro é pelo título, não pelo nome do arquivo.

Cada `test()` deve começar com o ID da API, ex.: `test("QA-FIN-INS-03: …")`.

---

## 4. Matriz implementada

### P0

`QA-AUTH-01/02/04`, `QA-RBAC-02`, `QA-DASH-01/05`, `QA-TUR-03/04`, `QA-DIA-01`, `QA-ENT-01/03`, `QA-AVA-01..05`, `QA-MEC-01/02`, `QA-E2E-01`, `QA-PORTAL-01/04`, `QA-DOC-01/04`, `QA-FIN-INS-01`.

### P1

`QA-AUTH-13`, `QA-AUTH-07` (UI perfil), `QA-FIN-INS-02/03/04`, `QA-DOC-02/03/05`, `QA-PORTAL-02` (403 por `alunoId`), `QA-PORTAL-05`, `QA-MAT-06` (status → TRANCADO), `QA-FIN-03` (baixa fatura).

### Backlog (ainda sem Playwright)

- Termo de abertura (`QA-TERMO-*`)
- Transferência interna (preview + efetivar)
- Parametrizações (`QA-PAR-*`)
- CRUD acadêmico feliz + 409 (`QA-ACA-*` / `QA-MTZ-*`)
- Webhook Stripe → `ATIVO` ponta a ponta (preferir API/Postman)

Ao promover um item do backlog, atualize a matriz **neste** arquivo e a seção 17 do doc da API.

---

## 5. Convenções de implementação

- TypeScript estrito; Page Object Model
- Locators semânticos (`getByRole`, `getByText`); evitar CSS frágil
- Web-first assertions (sem `waitForTimeout` fixo)
- Mock da API via servidor `3334`; `page.route` só para exceções (ex.: redirect Stripe)
- Evidências (screenshot/vídeo/trace) só em falha / first retry
- CI: GitHub Actions com sharding; artifacts de report

---

## 6. Personas do mock (seed E2E)

Alinhadas ao seed da API, espelhadas no mock:

| Papel | Identificador | Senha |
| :---- | :------------ | :---- |
| ADMIN | `testeadmin@opensga.dev` | `Admin@123456` |
| PROFESSOR | `PROF-001` / e-mail do mock | `Professor@123456` |
| ALUNO | `2026000001` / `aluno@opensga.dev` | `Aluno@123456` |
| RESPONSAVEL | `responsavel@opensga.dev` | `Responsavel@123456` |

Detalhes de massa e regras: doc da API, seção Personas / domínio correspondente.

---

## 7. Cenários BDD cobertos pela suíte

Espelho dos Given/When/Then usados para escrever cada `test('QA-…')`.
Quando a regra mudar na API, atualize o Gherkin lá **e** o bloco correspondente aqui.

### P0

#### `QA-AUTH-01` → `e2e/auth.spec.ts`

```gherkin
@QA-AUTH-01
Cenário: Login unificado do administrador
  Dado o identificador "testeadmin@opensga.dev" e a senha "Admin@123456"
  Quando envio POST /api/v1/auth/login
  Então a resposta é 200
  E o corpo contém token JWT
  E user.role é "ADMIN"
```


#### `QA-AUTH-02` → `e2e/auth.spec.ts`

```gherkin
@QA-AUTH-02
Cenário: Login do professor por matrícula funcional
  Dado o identificador "PROF-001" e a senha "Professor@123456"
  Quando envio POST /api/v1/auth/login
  Então user.role é "PROFESSOR"
```


#### `QA-AUTH-04` → `e2e/auth.spec.ts`

```gherkin
@QA-AUTH-04
Cenário: Credenciais inválidas
  Dado um identificador existente e senha "errada"
  Quando envio POST /api/v1/auth/login
  Então a resposta é 401
```


#### `QA-RBAC-02` → `e2e/rbac.spec.ts`

```gherkin
@QA-RBAC-02
Cenário: Professor tenta criar campus
  Dado que estou autenticado como PROFESSOR
  Quando envio POST /api/v1/academic/campi com payload válido
  Então a resposta é 403
```


#### `QA-DASH-01` → `e2e/dashboard.spec.ts`

```gherkin
@QA-DASH-01
Cenário: Dashboard administrativo
  Dado um JWT de ADMIN
  Quando envio GET /api/v1/dashboard/admin
  Então a resposta é 200
  E matriculasPorStatus contém todos os status do enum
```


#### `QA-DASH-05` → `e2e/dashboard.spec.ts`

```gherkin
@QA-DASH-05
Cenário: Dashboard do professor
  Dado um JWT de PROFESSOR do seed
  Quando envio GET /api/v1/dashboard/professor
  Então a resposta é 200
  E lancamentosPendentes é maior que 0
```


#### `QA-TUR-03` → `e2e/turmas.spec.ts`

```gherkin
@QA-TUR-03
Cenário: Professor vê apenas as próprias turmas
  Dado um JWT de PROFESSOR titular da turma do seed
  Quando envio GET /api/v1/academic/turmas
  Então todos os itens têm professor.user.id igual ao meu sub
  E a turma do seed aparece
```


#### `QA-TUR-04` → `e2e/turmas.spec.ts`

```gherkin
@QA-TUR-04
Cenário: Professor acessa turma de outro docente
  Dado um JWT de PROFESSOR
  E um turmaId de outro professor
  Quando envio GET /api/v1/academic/turmas/:id
  Então a resposta é 403
```


#### `QA-DIA-01` → `e2e/turmas.spec.ts`

```gherkin
@QA-DIA-01
Cenário: Professor abre diário da própria turma
  Dado que estou autenticado como PROFESSOR titular
  Quando abro a turma nas Minhas Turmas e acesso o diário
  Então vejo a lista de diários da turma
  E consigo navegar sem 403
```


#### `QA-ENT-01` → `e2e/enturmacao.spec.ts`

```gherkin
@QA-ENT-01
Cenário: Enturmar aluno ativo na disciplina da grade
  Dado matrícula ATIVO cuja matriz contém CALC1
  E uma turma de CALC1
  Quando envio POST /api/v1/diario/enturmar
  Então a resposta é 201
  E o corpo contém matriculaId e turmaId
```


#### `QA-ENT-03` → `e2e/enturmacao.spec.ts`

```gherkin
@QA-ENT-03
Cenário: Disciplina estranha à matriz
  Dado uma turma de disciplina que não está na matriz do aluno
  Quando tento enturmar
  Então a resposta é 400
```


#### `QA-AVA-01` → `e2e/avaliacao.spec.ts`

```gherkin
@QA-AVA-01
Cenário: Aprovação direta
  Dado um diário cuja disciplina tem chTotal 60
  E sou o professor titular
  Quando envio PATCH /diario/avaliar com notaAv 7, notaAvs 5, totalFaltas 0
  Então notaSemestral é 7
  E habilitaAv3 é false
  E statusDisciplina é EM_ABERTO
```


#### `QA-AVA-02` → `e2e/avaliacao.spec.ts`

```gherkin
@QA-AVA-02
Cenário: Elegível à AV3
  Dado chTotal 60 e faltas dentro do limite
  Quando lanço AV 4 e AVS 5 sem AV3
  Então notaSemestral é 5
  E habilitaAv3 é true
```


#### `QA-AVA-03` → `e2e/avaliacao.spec.ts`

```gherkin
@QA-AVA-03
Cenário: Aprovado na AV3 após fechamento
  Dado o diário do cenário anterior
  Quando lanço notaAv3 7
  E envio POST /diario/fechar-semestre da turma
  Então mediaFinal é 6
  E statusDisciplina é APROVADO
  E chCumprida é 60
```


#### `QA-AVA-04` → `e2e/avaliacao.spec.ts`

```gherkin
@QA-AVA-04
Cenário: Reprovação por falta no fechamento
  Dado chTotal 60 (limite 15 faltas)
  Quando lanço notaAv 10 e totalFaltas 16
  E fecho o semestre
  Então statusDisciplina é RF
  E chCumprida é 0
```


#### `QA-AVA-05` → `e2e/avaliacao.spec.ts`

```gherkin
@QA-AVA-05
Cenário: Professor de outra turma tenta lançar
  Dado um JWT de professor que não rege a turma do diário
  Quando envio PATCH /diario/avaliar
  Então a resposta é 403
```


#### `QA-MEC-01` → `e2e/mec.spec.ts`

```gherkin
@QA-MEC-01
Cenário: Matriz conforme CNE/CES 7/2018
  Dado uma matriz cuja soma de chExtensao é pelo menos 10% da soma de chTotal
  Quando solicito GET /academic/matrizes/:id/auditoria-mec
  Então a resposta é 200
  E cumpreRegra10PorcentoExtensao é true
```


#### `QA-MEC-02` → `e2e/mec.spec.ts`

```gherkin
@QA-MEC-02
Cenário: Matriz inconforme em extensão
  Dado uma matriz com extensão abaixo de 10%
  Quando solicito a auditoria MEC
  Então a resposta é 200
  E cumpreRegra10PorcentoExtensao é false
```


#### `QA-E2E-01` → `e2e/jornada.spec.ts`

```gherkin
@QA-E2E-01
Cenário: Do campus à aprovação do aluno
  Dado um JWT de ADMIN
  Quando crio campus → curso → disciplina → matriz → componente (CH válida, extensão ≥ 10%)
  E audito a matriz (cumpreRegra10PorcentoExtensao true)
  E crio professor e turma
  E efetivo matrícula ATIVO na matriz
  E enturmo o aluno
  E o professor lista a turma e o diário
  E o professor lança AV 7, AVS 7, faltas 0
  Então o diário está aprovado com chCumprida = chTotal
  E GET /dashboard/admin reflete a matrícula ATIVO
  E GET /dashboard/professor deixa de contar esse diário como pendente após AV ou AVS
```


#### `QA-PORTAL-01` → `e2e/portal-aluno.spec.ts`

```gherkin
@QA-PORTAL-01
Cenário: Aluno lê o próprio contexto
  Dado que estou autenticado como ALUNO
  Quando solicito GET /api/v1/portal/contexto
  Então a resposta é 200
  E o corpo contém profile, matricula, disciplinas e faturas do próprio aluno
```


#### `QA-PORTAL-04` → `e2e/portal-aluno.spec.ts`

```gherkin
@QA-PORTAL-04
Cenário: Boletim do portal usa a situação oficial do diário
  Dado que estou autenticado como ALUNO
  E minhas disciplinas do período ainda não tiveram o semestre fechado
  Quando solicito GET /api/v1/portal/contexto
  Então a resposta é 200
  E cada disciplina em aberto tem statusDisciplina = EM_ABERTO e semestreFechado = false
  E o cliente do portal exibe essa situação sem simular fechamento
```


#### `QA-DOC-01` → `e2e/portal-aluno.spec.ts`

```gherkin
@QA-DOC-01
Cenário: Aluno lista só documentos liberados
  Dado que estou autenticado como ALUNO
  E a Secretaria desativou o modelo HISTORICO_PARCIAL
  Quando solicito GET /api/v1/portal/documentos
  Então a resposta é 200
  E o corpo não contém tipo HISTORICO_PARCIAL
```
> No Playwright, `QA-DOC-01` e `QA-DOC-04` estão no mesmo `test()` em `portal-aluno.spec.ts`.


#### `QA-DOC-04` → `e2e/portal-aluno.spec.ts`

```gherkin
@QA-DOC-04
Cenário: Emissão interpola o texto da Secretaria
  Dado que estou autenticado como ALUNO
  E a matrícula está ATIVO
  Quando envio POST /api/v1/portal/documentos/emitir com tipo DECLARACAO_MATRICULA
  Então a resposta é 200
  E o corpo contém o nome do aluno no texto interpolado
  E codigoAutenticacao começa com AUT-
```
> No Playwright, `QA-DOC-01` e `QA-DOC-04` estão no mesmo `test()` em `portal-aluno.spec.ts`.


#### `QA-FIN-INS-01` → `e2e/inscricao.spec.ts`

```gherkin
@QA-FIN-INS-01
Cenário: Inscrição pública isenta (UI)
  Dado um curso precificado com 1ª parcela isenta no mock
  Quando submeto o formulário público de inscrição com dados válidos
  Então a API devolve requiresCheckout=false e acesso.ra
  E na secretaria a matrícula aparece como Pré-matriculado
```


### P1

#### `QA-AUTH-07` → `e2e/auth-p1.spec.ts`

```gherkin
@QA-AUTH-07
Cenário: Troca de senha com senha atual válida
  Dado um JWT válido
  Quando envio PATCH /api/v1/auth/senha com senhaAtual correta e senhaNova com 8+ caracteres
  Então a resposta é 200
  E o login com a senha nova sucede
  E o login com a senha antiga retorna 401
```


#### `QA-AUTH-13` → `e2e/auth-p1.spec.ts`

```gherkin
@QA-AUTH-13
Cenário: Login unificado do aluno por RA (UI)
  Dado o identificador "2026000001" e a senha "Aluno@123456"
  Quando submeto o formulário em /login-aluno
  Então sou redirecionado para /area-aluno/dashboard
  E a UI exibe o RA do aluno
```


#### `QA-PORTAL-02` → `e2e/portal-p1.spec.ts`

```gherkin
@QA-PORTAL-02
Cenário: Responsável não acessa aluno de outra guarda
  Dado que estou autenticado como RESPONSAVEL
  Quando solicito GET /api/v1/portal/contexto?alunoId=uuid-de-outro-aluno
  Então a resposta é 403
```


#### `QA-PORTAL-05` → `e2e/portal-p1.spec.ts`

```gherkin
@QA-PORTAL-05
Cenário: Portal exibe faturas e comunicados do contexto (UI)
  Dado que estou autenticado como ALUNO
  Quando abro /area-aluno/faturas e /area-aluno/comunicados
  Então vejo as faturas devolvidas pelo contexto
  E vejo comunicados filtrados por publicoAlvo
```


#### `QA-DOC-02` → `e2e/portal-p1.spec.ts`

```gherkin
@QA-DOC-02
Cenário: Declaração exige matrícula ativa
  Dado que estou autenticado como ALUNO
  E a matrícula do aluno não está ATIVO
  Quando envio POST /api/v1/portal/documentos/emitir com tipo DECLARACAO_MATRICULA
  Então a resposta é 400
```


#### `QA-DOC-03` → `e2e/portal-p1.spec.ts`

```gherkin
@QA-DOC-03
Cenário: Quitação bloqueada por fatura atrasada
  Dado que estou autenticado como ALUNO
  E o aluno possui fatura ATRASADA
  Quando envio POST /api/v1/portal/documentos/emitir com tipo QUITACAO_FINANCEIRA
  Então a resposta é 409
```


#### `QA-DOC-05` → `e2e/secretaria-p1.spec.ts`

```gherkin
@QA-DOC-05
Cenário: Professor não edita modelos de documento
  Dado que estou autenticado como PROFESSOR
  Quando solicito GET /api/v1/documentos/modelos
  Então a resposta é 403
```


#### `QA-FIN-INS-02` → `e2e/inscricao-p1.spec.ts`

```gherkin
@QA-FIN-INS-02
Cenário: CPF e e-mail de pessoas diferentes (UI)
  Dado CPF e e-mail apontando para cadastros distintos no mock
  Quando submeto a inscrição pública
  Então a API responde 400
  E a UI exibe mensagem de erro
```


#### `QA-FIN-INS-03` → `e2e/inscricao-p1.spec.ts`

```gherkin
@QA-FIN-INS-03
Cenário: Inscrição com checkout Stripe (UI)
  Dado e-mail @checkout.e2e.dev (valor devido > 0 no mock)
  Quando submeto a inscrição pública
  Então requiresCheckout=true e url aponta para checkout.stripe.com
  E o browser é redirecionado ao checkout (mockado)
```


#### `QA-FIN-INS-04` → `e2e/inscricao-p1.spec.ts`

```gherkin
@QA-FIN-INS-04
Cenário: Login no portal após inscrição isenta (UI)
  Dado uma inscrição isenta recém-criada com acesso.ra e senhaProvisoria
  Quando faço login em /login-aluno com essas credenciais
  Então sou redirecionado ao dashboard do aluno
  E a UI exibe o RA e situação Pré-matriculado
```


#### `QA-MAT-06` → `e2e/secretaria-p1.spec.ts`

```gherkin
@QA-MAT-06
Cenário: Alterar situação da matrícula para TRANCADO (UI)
  Dado que estou autenticado como ADMIN
  E a matrícula do RA 2026000001 está ATIVO
  Quando abro o ciclo de status em /area-admin/matriculas
  E escolho "Trancado (interrupção temporária)" e confirmo
  Então a linha do RA exibe "Trancado"
```


#### `QA-FIN-03` → `e2e/secretaria-p1.spec.ts`

```gherkin
@QA-FIN-03
Cenário: Baixa de fatura
  Dado uma fatura PENDENTE
  Quando envio PATCH /financeiro/faturas/:id/status com { "status": "PAGA" }
  Então status é PAGA
  E pagoEm não é null
```
