import {annotate} from "./helpers/annotations";
import {expect, test} from "./fixtures/test";

test.describe("Dashboard @p0", () => {
  test("QA-DASH-01: dashboard administrativo", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Dashboard", feature: "Admin KPIs", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");
    await expect(page).toHaveURL(/\/area-admin\/dashboard/);

    await expect(page.getByText("Matrículas totais")).toBeVisible();
    await expect(page.getByText("Ciclo de matrículas")).toBeVisible();
    await expect(page.getByText(/faturas/i).first()).toBeVisible();
    await expect(page.getByText("50.0%")).toBeVisible();
  });

  test("QA-DASH-05: dashboard do professor", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Dashboard", feature: "Professor KPIs", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await expect(page).toHaveURL(/\/area-admin\/dashboard/);

    await expect(page.getByRole("heading", {name: /olá,\s*professor e2e/i})).toBeVisible();
    await expect(page.getByText("Lançamentos pendentes")).toBeVisible();
    await expect(page.getByText("CALC1-2026.2")).toBeVisible();
  });
});
