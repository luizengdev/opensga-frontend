import {annotate} from "./helpers/annotations";
import {mockLoginUnauthorized} from "./mocks/api";
import {expect, test} from "./fixtures/test";

test.describe("Auth @p0", () => {
  test("QA-AUTH-01: login unificado do administrador", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Identidade", feature: "Login admin", severity: "blocker"});

    await loginAdminPage.goto();
    await expect(loginAdminPage.identificadorInput).toBeVisible();
    await expect(loginAdminPage.senhaInput).toBeVisible();

    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");

    await expect(page).toHaveURL(/\/area-admin\/dashboard/);
    await expect(page.getByText("ADMIN", {exact: true})).toBeVisible();
    await expect(loginAdminPage.formError).toHaveCount(0);
  });

  test("QA-AUTH-02: login do professor por matrícula", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Identidade", feature: "Login professor", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");

    await expect(page).toHaveURL(/\/area-admin\/dashboard/);
    await expect(page.getByText("DOCENTE", {exact: true})).toBeVisible();
    await expect(page.getByRole("heading", {name: /olá,\s*professor e2e/i})).toBeVisible();
  });

  test("QA-AUTH-04: credenciais inválidas", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Identidade", feature: "Login admin", severity: "critical"});

    await mockLoginUnauthorized(page, "Credenciais inválidas");

    await loginAdminPage.goto();
    await loginAdminPage.login("testeadmin@opensga.dev", "senha-errada");

    await expect(loginAdminPage.formError).toBeVisible();
    await expect(loginAdminPage.formError).toContainText(/credenciais inválidas|erro ao processar/i);
    await expect(page).toHaveURL(/\/login-admin/);
  });
});
