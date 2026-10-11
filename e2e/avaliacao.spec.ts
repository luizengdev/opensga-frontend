import {annotate} from "./helpers/annotations";
import {resetMockApi} from "./helpers/reset-mock";
import {expect, test, TURMA_ID} from "./fixtures/test";

test.describe("Avaliação @p0", () => {
  test.beforeEach(async () => {
    await resetMockApi();
  });

  test("QA-AVA-01: aprovação direta (AV/AVS)", async ({
    page,
    loginAdminPage,
    turmaDetailPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Avaliação", feature: "Lançamento", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await turmaDetailPage.goto(TURMA_ID);

    await turmaDetailPage.openAvaliacao();
    await expect(page.getByRole("heading", {name: /lançamento acadêmico/i})).toBeVisible();
    await turmaDetailPage.fillNotas("7", "5", "0");
    await expect(page.getByText(/NS:\s*7/i)).toBeVisible();
    await turmaDetailPage.saveAvaliacao();

    await expect(page.getByText("Lançamento salvo").first()).toBeVisible();
    await expect(page.getByText("7.0").first()).toBeVisible();
    await expect(page.getByText("Em Aberto").first()).toBeVisible();
  });

  test("QA-AVA-02: elegível à AV3", async ({page, loginAdminPage, turmaDetailPage}, testInfo) => {
    annotate(testInfo, {epic: "Avaliação", feature: "Lançamento", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await turmaDetailPage.goto(TURMA_ID);

    await turmaDetailPage.openAvaliacao();
    await turmaDetailPage.fillNotas("4", "5", "0");
    await expect(page.getByText(/NS:\s*5/i)).toBeVisible();
    await turmaDetailPage.saveAvaliacao();

    await expect(page.getByText("AV3").first()).toBeVisible();
  });

  test("QA-AVA-03: aprovado na AV3 após fechamento", async ({
    page,
    loginAdminPage,
    turmaDetailPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Avaliação", feature: "Fechamento", severity: "blocker"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await turmaDetailPage.goto(TURMA_ID);

    await turmaDetailPage.openAvaliacao();
    await turmaDetailPage.fillNotas("4", "5", "0");
    await turmaDetailPage.saveAvaliacao();
    await expect(page.getByText("AV3").first()).toBeVisible();

    await turmaDetailPage.openAvaliacao();
    await page.getByLabel(/av3 \(0 a 10\)/i).fill("7");
    await turmaDetailPage.saveAvaliacao();

    await turmaDetailPage.fecharSemestreButton.click();
    await page.getByRole("button", {name: /^fechar semestre$/i}).last().click();

    await expect(page.getByText("Aprovado").first()).toBeVisible();
    await expect(page.getByRole("button", {name: /semestre fechado/i})).toBeVisible();
  });

  test("QA-AVA-04: reprovação por falta no fechamento", async ({
    page,
    loginAdminPage,
    turmaDetailPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Avaliação", feature: "Fechamento RF", severity: "critical"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");
    await turmaDetailPage.goto(TURMA_ID);

    await turmaDetailPage.openAvaliacao();
    await turmaDetailPage.fillNotas("10", "10", "16");
    await turmaDetailPage.saveAvaliacao();

    await turmaDetailPage.fecharSemestreButton.click();
    await page.getByRole("button", {name: /^fechar semestre$/i}).last().click();

    await expect(page.getByText("RF").first()).toBeVisible();
  });

  test("QA-AVA-05: professor não titular não lança", async ({page, loginAdminPage}, testInfo) => {
    annotate(testInfo, {epic: "Avaliação", feature: "RBAC titular", severity: "critical"});

    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("PROF-001", "Professor@123456");

    const loginRes = await page.request.post("http://127.0.0.1:3334/api/v1/auth/login", {
      data: {identificador: "PROF-001", senha: "Professor@123456"},
    });
    const {token} = (await loginRes.json()) as {token: string};

    const avaliarRes = await page.request.patch("http://127.0.0.1:3334/api/v1/diario/avaliar", {
      headers: {Authorization: `Bearer ${token}`},
      data: {
        diarioClasseId: "00000000-0000-4000-8000-0000000000xx",
        notaAv: 7,
      },
    });

    expect(avaliarRes.status()).toBe(403);
  });
});
