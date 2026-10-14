import {annotate} from "./helpers/annotations";
import {resetMockApi} from "./helpers/reset-mock";
import {expect, test} from "./fixtures/test";

test.describe("Secretaria @p1", () => {
  test.beforeEach(async () => {
    await resetMockApi();
  });

  test("QA-MAT-06: alterar situação do aluno para TRANCADO", async ({
    page,
    loginAdminPage,
    matriculasAdminPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Secretaria",
      feature: "Matrículas",
      severity: "critical",
      tags: ["QA-MAT-06"],
    });

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");
    await matriculasAdminPage.goto();
    await matriculasAdminPage.search("2026000001");

    const row = matriculasAdminPage.rowByRa("2026000001");
    await expect(row).toBeVisible();
    await row.getByRole("button", {name: /ciclo de status/i}).click();
    await page.getByRole("combobox").last().click();
    await page.getByRole("option", {name: /Trancado \(interrupção temporária\)/i}).click();
    await page.getByRole("button", {name: /atualizar status/i}).click();

    await expect(page.getByText(/status|atualizad|sucesso/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(row.getByText("Trancado")).toBeVisible();
  });

  test("QA-FIN-03: baixa de fatura pendente para PAGA", async ({
    page,
    loginAdminPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Financeiro",
      feature: "Faturas",
      severity: "critical",
      tags: ["QA-FIN-03"],
    });

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");
    await page.goto("/area-admin/financeiro/faturas");
    await expect(page.getByText(/faturas acadêmicas/i).first()).toBeVisible();

    const row = page.getByRole("row").filter({hasText: "Mensalidade 2026.2"});
    await expect(row).toBeVisible();
    await row.getByRole("button", {name: /alterar status/i}).click();
    await page.getByRole("combobox").last().click();
    await page.getByRole("option", {name: /^Paga/i}).click();
    await page.getByRole("button", {name: /salvar status/i}).click();

    await expect(page.getByText(/status da fatura atualizado|sucesso/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(row.getByText(/^Paga$/i)).toBeVisible();
  });

  test("QA-DOC-05: professor não lista modelos de documento", async ({
    page,
    loginAdminPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Documentos",
      feature: "RBAC modelos",
      severity: "critical",
      tags: ["QA-DOC-05"],
    });

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");

    const loginRes = await page.request.post("http://127.0.0.1:3334/api/v1/auth/login", {
      data: {identificador: "PROF-001", senha: "Professor@123456"},
    });
    const {token} = (await loginRes.json()) as {token: string};
    const modelos = await page.request.get("http://127.0.0.1:3334/api/v1/documentos/modelos", {
      headers: {Authorization: `Bearer ${token}`},
    });
    expect(modelos.status()).toBe(403);
  });
});
