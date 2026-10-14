# STAK-2: E2E Playwright — Inscrição pública e verificação de matrícula

| Campo       | Valor                                                                 |
| :---------- | :-------------------------------------------------------------------- |
| Status      | Implementado                                                          |
| Escopo      | Front E2E P0 — fluxo público `/inscricao` + prova de matrícula no SGA |
| Spec QA     | `QA-FIN-INS-01` (API) · UI em `app/(public)/inscricao`                 |
| Recorte     | Inscrição **isenta** (sem Checkout Stripe)                            |

---

## 1. Objetivo

Cobrir ponta a ponta a inscrição pública e **verificar que a matrícula foi criada no sistema**, sem depender de Stripe real nem de webhook.

Alinhamento de negócio (API):

- `GET /api/catalogo` — cursos com preço ativo
- `POST /api/inscricao` — cria aluno + matrícula `PRE_MATRICULADO` (ou reutiliza aluno por CPF/e-mail)
- Se valor devido agora = R$ 0 → `requiresCheckout=false`, `url=null`, devolve `acesso.ra` / `acesso.senhaProvisoria`
- Status `ATIVO` só após pagamento (webhook) — **fora deste E2E**

---

## 2. Por que este recorte

| Caminho                         | Usar neste stak? | Motivo                                      |
| :------------------------------ | :--------------- | :------------------------------------------ |
| Isento / valor devido agora = 0 | Sim              | Estável no mock; fecha `QA-FIN-INS-01`      |
| Checkout Stripe + webhook       | Não (ainda)      | Flaky; exige mock de redirect/webhook       |
| Assertar `ATIVO` no form        | Não              | Só ocorre após pagamento confirmado         |

---

## 3. Estado atual do mock E2E

Arquivo: `e2e/mocks/mock-api-server.mjs`

- Já existem login admin/aluno, academic, portal
- **Faltam** stubs de:
  - `GET /api/catalogo` e/ou `GET /api/v1/catalogo`
  - `POST /api/inscricao` e/ou `POST /api/v1/inscricao`
  - Persistência da matrícula criada no estado do mock (para o admin listar depois)

---

## 4. Roteiro do teste (Given / When / Then)

### ID sugerido: `QA-FIN-INS-01` (UI)

```gherkin
@QA-FIN-INS-01
Cenário: Inscrição isenta cria matrícula PRE_MATRICULADO visível na secretaria
  Dado que o catálogo mock tem um curso com preço ativo e 1ª parcela isenta
  Quando acesso /inscricao
  E escolho o curso
  E preencho nome, e-mail, CPF, telefone, data de nascimento e forma de ingresso
  E aceito a política de privacidade
  E envio a inscrição
  Então a API mock responde 200 com requiresCheckout=false e url nula
  E a UI mostra sucesso com RA (acesso.ra)
  Quando faço login como ADMIN
  E abro a lista de matrículas (ou filtro PRE_MATRICULADO)
  Então vejo a matrícula do RA criado com status PRE_MATRICULADO
  E o curso corresponde ao escolhido na inscrição
```

### Alternativa de verificação (opcional, mesmo stak ou follow-up)

- Login no **portal do aluno** com `acesso.ra` + `acesso.senhaProvisoria` do mock
- Dashboard mostra matrícula / curso (status ainda `PRE_MATRICULADO` ou equivalente na UI)

---

## 5. Implementação sugerida

### 5.1 Mock (`e2e/mocks/mock-api-server.mjs`)

1. **Catálogo** — devolver ao menos 1 oferta:

   - `cursoId` (UUID estável do mock, ex. curso já existente `IDS.curso`)
   - `nome`, `modalidade`, `campus`, `valor`, `moeda`, `intervalo`, `duracaoSemestres`, `tipoGraduacao`

2. **POST inscrição** — body: `nome`, `email`, `cpf`, `telefone?`, `dataNascimento`, `cursoModalidadeId`

   - Validar campos mínimos
   - Gerar RA (ex. `2026` + sequencial) e `senhaProvisoria` fixa de teste
   - Inserir em `matriculas` do estado do mock com `status: "PRE_MATRICULADO"`
   - Resposta:

     ```json
     {
       "url": null,
       "sessionId": null,
       "requiresCheckout": false,
       "status": "PRE_MATRICULADO",
       "acesso": {
         "email": "...",
         "ra": "2026xxxxxx",
         "senhaProvisoria": "Aluno@123456"
       }
     }
     ```

3. **GET /matriculas** (já existe) — incluir as matrículas criadas pela inscrição no array retornado ao ADMIN.

4. **Reset** — `__e2e/reset` deve limpar matrículas/alunos criados na inscrição (além do estado atual).

### 5.2 Page Objects

- `e2e/pages/inscricao.page.ts` — navegação ao catálogo, seleção de curso, preenchimento do formulário, submit
- Reutilizar `LoginAdminPage` + locators da lista de matrículas (criar page object se a tela admin ainda não tiver)

### 5.3 Spec

- Arquivo: `e2e/inscricao.spec.ts`
- Fixture: registrar page object se necessário
- Annotations Allure: epic `Ingresso`, feature `Inscrição pública`, tags `p0`, `QA-FIN-INS-01`
- CPF/e-mail **únicos por run** (timestamp) para não colidir com seed do mock

### 5.4 Asserts de UI (orientação)

- Sucesso: textos da `InscricaoSuccess` / RA visível
- Admin: status **Pré-matriculado** (label de `PRE_MATRICULADO`) + RA + nome do curso
- Não redirecionar para URL Stripe

---

## 6. Fora de escopo deste stak

- Checkout Stripe (`requiresCheckout=true`) e redirect
- Webhook `checkout.session.completed` → `ATIVO`
- Cupom real / `STRIPE_INSCRICAO_COUPON_ID` na API de produção
- Fluxo completo de e-mail (Nodemailer)
- Inscrição com CPF/e-mail conflitantes (400) — pode ser P1 depois

---

## 7. Critérios de aceite

1. Spec verde no Playwright (mock + Next), sem API/Postgres reais.
2. Matrícula criada pela inscrição aparece na secretaria como `PRE_MATRICULADO`.
3. Nenhum redirect para `checkout.stripe.com`.
4. `__e2e/reset` deixa o mock limpo para a próxima suíte.
5. README da suíte E2E menciona o cenário de inscrição pública (uma linha).

---

## 8. Ordem de execução sugerida

1. Estender o mock (catalogo + inscricao + estado de matrícula).
2. Page object + spec feliz (isento).
3. Rodar `npx playwright test e2e/inscricao.spec.ts`.
4. (Opcional) Segundo teste: login aluno com RA da inscrição.
5. Atualizar README E2E.

---

## 9. Referências

- API: `docs/qa-arquitetura-testes.md` — seção financeira / `QA-FIN-INS-*`
- Front E2E: `docs/e2e.md`
- Front: `app/(public)/inscricao`, `components/public/inscricao-form.tsx`
- Contrato: `createInscricao` → `POST /api/inscricao` (`lib/api/fetch-generated`)
- Suíte existente: `e2e/portal-aluno.spec.ts`, `e2e/jornada.spec.ts`
