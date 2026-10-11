import {annotate} from "./helpers/annotations";
import {expect, test} from "./fixtures/test";

test.describe("Auditoria MEC @p0", () => {
  test("QA-MEC-01: matriz conforme CNE/CES 7/2018", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Regulatório", feature: "Extensão", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");
    await page.getByRole("button", {name: "Matrizes & Auditoria MEC", exact: true}).click();
    await expect(page).toHaveURL(/\/area-admin\/matrizes/);

    await expect(page.getByText("Relatório de auditoria MEC")).toBeVisible();
    await expect(page.getByText(/extensão ≥/i).first()).toBeVisible();
    await expect(page.getByText("Conforme Decreto 12.456")).toBeVisible();
  });

  test("QA-MEC-02: matriz inconforme em extensão", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Regulatório", feature: "Extensão", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");
    await page.goto("/area-admin/matrizes");
    await expect(page.getByText("Relatório de auditoria MEC")).toBeVisible();

    await page.getByText(/matriz 2026\.1 conforme/i).first().click();
    await page.getByRole("option", {name: /matriz extensão baixa/i}).click();

    await expect(page.getByText(/extensão </i).first()).toBeVisible();
    await expect(page.getByText("Extensão abaixo de 10% da CH total.")).toBeVisible();
  });
});
