import {annotate} from "./helpers/annotations";
import {expect, test} from "./fixtures/test";

test.describe("Portal do aluno @p0", () => {
  test("QA-PORTAL-01: aluno acessa o próprio dashboard", async ({
    page,
    loginAlunoPage,
    portalAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Portal do aluno", feature: "Dashboard", severity: "blocker"});

    await loginAlunoPage.goto();
    await expect(loginAlunoPage.identificadorInput).toBeVisible();
    await loginAlunoPage.loginAndWait("aluno@opensga.dev", "Aluno@123456");

    await expect(page).toHaveURL(/\/area-aluno\/dashboard/);
    await expect(portalAlunoPage.welcomeHeading("Aluno")).toBeVisible();
    await expect(page.getByText(/RA\s*2026000001/i).first()).toBeVisible();
    await expect(page.getByText("Engenharia de Software").first()).toBeVisible();
    await expect(page.getByText("Cálculo I").first()).toBeVisible();
    await expect(page.getByText("Ativo").first()).toBeVisible();
  });

  test("QA-PORTAL-04: boletim exibe situação oficial EM_ABERTO", async ({
    page,
    loginAlunoPage,
    portalAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {epic: "Portal do aluno", feature: "Boletim", severity: "blocker"});

    await loginAlunoPage.goto();
    await loginAlunoPage.loginAndWait("aluno@opensga.dev", "Aluno@123456");

    await portalAlunoPage.gotoNotas();
    await expect(page).toHaveURL(/\/area-aluno\/notas/);
    await expect(page.getByRole("heading", {name: /notas e frequência/i})).toBeVisible();
    await expect(page.getByText("Lançamento Aberto")).toBeVisible();

    const row = portalAlunoPage.disciplinaRow("Cálculo I");
    await expect(row).toBeVisible();
    await expect(row.getByText("Em aberto")).toBeVisible();
    await expect(page.getByText("Semestre fechado")).toHaveCount(0);
  });

  test("QA-DOC-01 / QA-DOC-04: lista documentos e emite declaração", async ({
    page,
    loginAlunoPage,
    portalAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Portal do aluno",
      feature: "Documentos",
      severity: "critical",
      tags: ["QA-DOC-01", "QA-DOC-04"],
    });

    await loginAlunoPage.goto();
    await loginAlunoPage.loginAndWait("aluno@opensga.dev", "Aluno@123456");

    await portalAlunoPage.gotoDocumentos();
    await expect(page).toHaveURL(/\/area-aluno\/documentos/);
    await expect(page.getByRole("heading", {name: /emissão de documentos oficiais/i})).toBeVisible();
    await expect(page.getByRole("heading", {name: "Declaração de Matrícula"})).toBeVisible();
    await expect(page.getByRole("heading", {name: "Carteirinha Estudantil"})).toBeVisible();

    await portalAlunoPage.emitirDocumentoButton("Declaração de Matrícula").click();

    await expect(page.getByText(/autenticidade:\s*AUT-/i)).toBeVisible({timeout: 15_000});
    await expect(page.getByText(/Aluno E2E/i).first()).toBeVisible();
    await expect(page.getByText(/RA\s*2026000001|2026000001/i).first()).toBeVisible();
  });
});
