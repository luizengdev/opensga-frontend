import {annotate} from "./helpers/annotations";
import {resetMockApi} from "./helpers/reset-mock";
import {expect, test, TURMA_ID} from "./fixtures/test";

test.describe("Enturmação @p0", () => {
  test.beforeEach(async () => {
    await resetMockApi();
  });

  test("QA-ENT-01: enturmar aluno ativo na disciplina da grade", async ({
    page,
    loginAdminPage,
    turmaDetailPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Ingresso", feature: "Enturmação", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");
    await turmaDetailPage.goto(TURMA_ID);

    await turmaDetailPage.enturmarButton.click();
    await expect(page.getByRole("heading", {name: /enturmar aluno/i})).toBeVisible();

    await page.getByRole("combobox").click();
    await page.getByRole("option", {name: /2026000002/}).click();
    await page.getByRole("button", {name: /efetivar enturmação/i}).click();

    await expect(page.getByText("Aluno enturmado.").first()).toBeVisible();
    await expect(page.getByText("Aluno Novo E2E")).toBeVisible();
  });

  test("QA-ENT-03: disciplina estranha à matriz", async ({
    page,
    loginAdminPage,
    turmaDetailPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Ingresso", feature: "Enturmação", severity: "critical"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");
    await turmaDetailPage.goto(TURMA_ID);

    await turmaDetailPage.enturmarButton.click();
    await page.getByRole("combobox").click();
    await page.getByRole("option", {name: /2026000099/}).click();
    await page.getByRole("button", {name: /efetivar enturmação/i}).click();

    await expect(page.getByText(/disciplina fora da matriz|erro ao processar/i).first()).toBeVisible();
  });
});
