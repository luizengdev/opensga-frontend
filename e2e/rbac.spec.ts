import {annotate} from "./helpers/annotations";
import {expect, test} from "./fixtures/test";

test.describe("RBAC @p0", () => {
  test("QA-RBAC-02: professor não acessa CRUD de campus", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Segurança", feature: "RBAC", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await expect(page).toHaveURL(/\/area-admin\/dashboard/);

    await expect(page.getByRole("heading", {name: /olá,\s*professor e2e/i})).toBeVisible();
    await expect(page.getByText("DOCENTE", {exact: true})).toBeVisible();
    await expect(page.getByRole("button", {name: "Minhas Turmas", exact: true})).toBeVisible();
    await expect(page.getByRole("button", {name: "Campi e Polos", exact: true})).toHaveCount(0);
    await expect(page.getByRole("button", {name: "Gestão de Pessoas", exact: true})).toHaveCount(0);
  });
});
