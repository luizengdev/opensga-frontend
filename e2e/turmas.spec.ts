import {annotate} from "./helpers/annotations";
import {expect, test, TURMA_ID, TURMA_OUTRA_ID} from "./fixtures/test";

test.describe("Turmas @p0", () => {
  test("QA-TUR-03: professor vê apenas as próprias turmas", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Acadêmico", feature: "Turmas", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await page.getByRole("button", {name: "Minhas Turmas", exact: true}).click();
    await expect(page).toHaveURL(/\/area-admin\/turmas/);

    await expect(page.getByText("CALC1-2026.2")).toBeVisible();
    await expect(page.getByText("CALC1-OUTRA")).toHaveCount(0);
  });

  test("QA-TUR-04: professor não acessa turma de outro docente", async ({
    page,
    loginAdminPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Acadêmico", feature: "Turmas", severity: "critical"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await page.goto(`/area-admin/turmas/${TURMA_OUTRA_ID}`);
    await expect(page.getByText("This page could not be found.")).toBeVisible();
    await expect(page.getByText("CALC1-OUTRA")).toHaveCount(0);
  });

  test("QA-DIA-01: professor abre diário da própria turma", async ({
    page,
    loginAdminPage,
    turmaDetailPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Avaliação", feature: "Diário", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await turmaDetailPage.goto(TURMA_ID);

    await expect(page.getByText("CALC1-2026.2")).toBeVisible();
    await expect(page.getByText("Cálculo I")).toBeVisible();
    await expect(page.getByText("2026000001")).toBeVisible();
    await expect(page.getByText("Aluno E2E")).toBeVisible();
    await expect(page.getByRole("button", {name: /^lançar$/i})).toBeVisible();
  });
});
