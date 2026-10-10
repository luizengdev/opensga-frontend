import {annotate} from "./helpers/annotations";
import {resetMockApi} from "./helpers/reset-mock";
import {expect, test, TURMA_ID} from "./fixtures/test";

test.describe("Jornada @p0", () => {
  test("QA-E2E-01: do campus à aprovação do aluno", async ({
    page,
    loginAdminPage,
    turmaDetailPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Regressão", feature: "Jornada completa", severity: "blocker"});
    await resetMockApi();

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");
    await expect(page).toHaveURL(/\/area-admin\/dashboard/);
    await expect(page.getByText("Matrículas totais")).toBeVisible();

    await page.getByRole("button", {name: "Matrizes & Auditoria MEC", exact: true}).click();
    await expect(page.getByText(/extensão ≥/i).first()).toBeVisible();

    await turmaDetailPage.goto(TURMA_ID);
    await expect(page.getByText("CALC1-2026.2")).toBeVisible();
    await expect(page.getByText("Aluno E2E")).toBeVisible();

    await page.context().clearCookies();
    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await turmaDetailPage.goto(TURMA_ID);

    await turmaDetailPage.openAvaliacao();
    await turmaDetailPage.fillNotas("7", "6", "0");
    await turmaDetailPage.saveAvaliacao();
    await expect(page.getByText("7.0").first()).toBeVisible();

    await turmaDetailPage.fecharSemestreButton.click();
    await page.getByRole("button", {name: /^fechar semestre$/i}).last().click();

    await expect(page.getByText("Aprovado").first()).toBeVisible();
    await expect(page.getByRole("button", {name: /semestre fechado/i})).toBeVisible();
  });
});
