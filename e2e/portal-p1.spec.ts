import {annotate} from "./helpers/annotations";
import {resetMockApi} from "./helpers/reset-mock";
import {expect, test} from "./fixtures/test";

test.describe("Portal do aluno @p1", () => {
  test.beforeEach(async () => {
    await resetMockApi();
  });

  test("QA-DOC-02: declaração exige matrícula ativa", async ({
    page,
    loginAlunoPage,
    portalAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Portal do aluno",
      feature: "Documentos",
      severity: "critical",
      tags: ["QA-DOC-02"],
    });

    await loginAlunoPage.goto();
    await loginAlunoPage.loginAndWait("pre@opensga.dev", "Aluno@123456");
    await portalAlunoPage.gotoDocumentos();
    await portalAlunoPage.emitirDocumentoButton("Declaração de Matrícula").click();

    await expect(page.getByText(/matrícula ativa|erro ao processar/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/autenticidade:\s*AUT-/i)).toHaveCount(0);
  });

  test("QA-DOC-03: quitação bloqueada por fatura atrasada", async ({
    page,
    loginAlunoPage,
    portalAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Portal do aluno",
      feature: "Documentos",
      severity: "critical",
      tags: ["QA-DOC-03"],
    });

    await loginAlunoPage.goto();
    await loginAlunoPage.loginAndWait("aluno@opensga.dev", "Aluno@123456");
    await portalAlunoPage.gotoDocumentos();
    await expect(page.getByRole("heading", {name: "Quitação Financeira"})).toBeVisible();
    await portalAlunoPage.emitirDocumentoButton("Quitação Financeira").click();

    await expect(page.getByText(/atrasada|quitação bloqueada|erro ao processar/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("QA-PORTAL-05: aluno vê faturas e comunicados do contexto", async ({
    page,
    loginAlunoPage,
    portalAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Portal do aluno",
      feature: "Faturas e comunicados",
      severity: "normal",
      tags: ["QA-PORTAL-05"],
    });

    await loginAlunoPage.goto();
    await loginAlunoPage.loginAndWait("aluno@opensga.dev", "Aluno@123456");

    await portalAlunoPage.gotoFaturas();
    await expect(page.getByText(/mensalidades|faturas/i).first()).toBeVisible();
    await expect(page.getByText("Mensalidade 2026.2").first()).toBeVisible();
    await expect(page.getByText(/atrasad|pendente/i).first()).toBeVisible();

    await portalAlunoPage.gotoComunicados();
    await expect(page.getByText(/comunicados|avisos/i).first()).toBeVisible();
    await expect(page.getByText("Aviso E2E do período")).toBeVisible();
  });

  test("QA-PORTAL-02: responsável não acessa aluno de outra guarda", async ({
    page,
    loginAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Portal do aluno",
      feature: "Guarda",
      severity: "critical",
      tags: ["QA-PORTAL-02"],
    });

    await loginAlunoPage.goto();
    await loginAlunoPage.loginAndWait("responsavel@opensga.dev", "Responsavel@123456");

    const loginRes = await page.request.post("http://127.0.0.1:3334/api/v1/auth/login", {
      data: {
        identificador: "responsavel@opensga.dev",
        senha: "Responsavel@123456",
      },
    });
    const {token} = (await loginRes.json()) as {token: string};
    const contexto = await page.request.get(
      "http://127.0.0.1:3334/api/v1/portal/contexto?alunoId=00000000-0000-4000-8000-00000000dead",
      {headers: {Authorization: `Bearer ${token}`}},
    );
    expect(contexto.status()).toBe(403);
  });
});
