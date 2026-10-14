import {annotate} from "./helpers/annotations";
import {resetMockApi} from "./helpers/reset-mock";
import {expect, test} from "./fixtures/test";

test.describe("Auth @p1", () => {
  test.beforeEach(async () => {
    await resetMockApi();
  });

  test("QA-AUTH-13: login unificado do aluno por RA", async ({
    page,
    loginAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Identidade",
      feature: "Login aluno",
      severity: "critical",
      tags: ["QA-AUTH-13"],
    });

    await loginAlunoPage.goto();
    await loginAlunoPage.loginAndWait("2026000001", "Aluno@123456");
    await expect(page).toHaveURL(/\/area-aluno\/dashboard/);
    await expect(page.getByText(/RA\s*2026000001/i).first()).toBeVisible();
  });

  test("QA-AUTH-07: troca de senha no perfil do aluno", async ({
    page,
    loginAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Identidade",
      feature: "Troca de senha",
      severity: "normal",
      tags: ["QA-AUTH-07"],
    });

    await loginAlunoPage.goto();
    await loginAlunoPage.loginAndWait("aluno@opensga.dev", "Aluno@123456");
    await page.goto("/area-aluno/perfil");

    await page.getByLabel(/^senha atual$/i).fill("Aluno@123456");
    await page.getByLabel(/^nova senha$/i).fill("Aluno@654321");
    await page.getByLabel(/confirmar nova senha/i).fill("Aluno@654321");
    await page.getByRole("button", {name: /salvar nova senha/i}).click();

    await expect(page.getByText(/senha foi redefinida|sucesso/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
