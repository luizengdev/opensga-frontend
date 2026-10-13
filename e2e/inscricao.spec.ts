import {annotate} from "./helpers/annotations";
import {resetMockApi} from "./helpers/reset-mock";
import {expect, test} from "./fixtures/test";

const uniqueCpf = () => {
  const digits = `${Date.now()}`.slice(-11).padStart(11, "0");
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

test.describe("Inscrição pública @p0", () => {
  test.beforeEach(async () => {
    await resetMockApi();
  });

  test("QA-FIN-INS-01: inscrição isenta cria matrícula PRE_MATRICULADO na secretaria", async ({
    page,
    inscricaoPage,
    loginAdminPage,
    matriculasAdminPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Ingresso",
      feature: "Inscrição pública",
      severity: "blocker",
      tags: ["QA-FIN-INS-01"],
    });

    const stamp = Date.now();
    const email = `inscricao.e2e.${stamp}@opensga.dev`;
    const nome = `Candidato E2E ${stamp}`;
    const cpf = uniqueCpf();

    await inscricaoPage.goto();
    await expect(page.getByText(/engenharia de software/i).first()).toBeVisible();
    await inscricaoPage.chooseCurso("Engenharia de Software");
    await inscricaoPage.openFormulario();
    await inscricaoPage.fillCadastro({
      nome,
      email,
      telefone: "(81) 98888-7777",
      cpf,
    });
    await inscricaoPage.fillIngresso({
      dataNascimento: "2000-05-15",
      formaIngresso: "Vestibular",
    });

    const response = await inscricaoPage.submitAndWaitResponse();
    expect(response.status()).toBe(200);
    const body = (await response.json()) as {
      requiresCheckout: boolean;
      url: string | null;
      acesso: {ra: string; email: string; senhaProvisoria: string | null};
    };
    expect(body.requiresCheckout).toBe(false);
    expect(body.url).toBeNull();
    expect(body.acesso.ra).toMatch(/^2026\d{6}$/);

    await expect(inscricaoPage.successHeading).toBeVisible();
    await expect(page.getByText(body.acesso.ra)).toBeVisible();
    await expect(page).not.toHaveURL(/checkout\.stripe\.com/);

    await page.context().clearCookies();
    await loginAdminPage.goto();
    await loginAdminPage.loginAndWait("testeadmin@opensga.dev", "Admin@123456");

    await matriculasAdminPage.goto();
    await expect(matriculasAdminPage.heading).toBeVisible();
    await matriculasAdminPage.filterByStatus("Pré-matriculado");
    await matriculasAdminPage.search(body.acesso.ra);

    const row = matriculasAdminPage.rowByRa(body.acesso.ra);
    await expect(row).toBeVisible();
    await expect(row.getByText("Pré-matriculado")).toBeVisible();
    await expect(row.getByText("Engenharia de Software")).toBeVisible();
    await expect(row.getByText(nome)).toBeVisible();
  });
});
