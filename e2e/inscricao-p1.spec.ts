import {annotate} from "./helpers/annotations";
import {resetMockApi} from "./helpers/reset-mock";
import {expect, test} from "./fixtures/test";

test.describe("Inscrição pública @p1", () => {
  test.beforeEach(async () => {
    await resetMockApi();
  });

  test("QA-FIN-INS-02: CPF e e-mail de pessoas diferentes retorna erro", async ({
    page,
    inscricaoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Ingresso",
      feature: "Inscrição pública",
      severity: "critical",
      tags: ["QA-FIN-INS-02"],
    });

    await inscricaoPage.goto();
    await inscricaoPage.chooseCurso("Engenharia de Software");
    await inscricaoPage.openFormulario();
    await inscricaoPage.fillCadastro({
      nome: "Conflito E2E",
      email: "outro.conflito@opensga.dev",
      telefone: "(81) 98888-1111",
      cpf: "222.222.222-22",
    });
    await inscricaoPage.fillIngresso({
      dataNascimento: "2001-01-10",
      formaIngresso: "ENEM",
    });

    const response = await inscricaoPage.submitAndWaitResponse();
    expect(response.status()).toBe(400);
    await expect(page.getByText(/pessoas diferentes|erro ao processar/i).first()).toBeVisible();
  });

  test("QA-FIN-INS-03: inscrição com checkout redireciona ao Stripe mock", async ({
    page,
    inscricaoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Ingresso",
      feature: "Inscrição pública",
      severity: "critical",
      tags: ["QA-FIN-INS-03"],
    });

    await inscricaoPage.goto();
    await inscricaoPage.chooseCurso("Engenharia de Software");
    await inscricaoPage.openFormulario();
    await inscricaoPage.fillCadastro({
      nome: "Checkout E2E",
      email: `checkout.${Date.now()}@checkout.e2e.dev`,
      telefone: "(81) 98888-2222",
      cpf: "777.777.777-77",
    });
    await inscricaoPage.fillIngresso({
      dataNascimento: "1999-08-20",
      formaIngresso: "Vestibular",
    });

    const checkoutCapture: {
      body?: {requiresCheckout: boolean; url: string | null};
    } = {};
    await page.route("**/api/inscricao", async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }
      const response = await route.fetch();
      checkoutCapture.body = (await response.json()) as {
        requiresCheckout: boolean;
        url: string | null;
      };
      await route.fulfill({
        status: response.status(),
        contentType: "application/json",
        body: JSON.stringify(checkoutCapture.body),
      });
    });
    await page.route("https://checkout.stripe.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>Stripe mock checkout</body></html>",
      });
    });

    await Promise.all([page.waitForURL(/checkout\.stripe\.com/), inscricaoPage.submit()]);
    expect(checkoutCapture.body?.requiresCheckout).toBe(true);
    expect(checkoutCapture.body?.url).toContain("checkout.stripe.com");
  });

  test("QA-FIN-INS-04: login no portal com RA da inscrição isenta", async ({
    page,
    inscricaoPage,
    loginAlunoPage,
  }, testInfo) => {
    annotate(testInfo, {
      epic: "Ingresso",
      feature: "Inscrição pública",
      severity: "critical",
      tags: ["QA-FIN-INS-04"],
    });

    const stamp = Date.now();
    const digits = String(stamp).slice(-11).padStart(11, "0");
    const cpf = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    await inscricaoPage.goto();
    await inscricaoPage.chooseCurso("Engenharia de Software");
    await inscricaoPage.openFormulario();
    await inscricaoPage.fillCadastro({
      nome: `Ingresso Portal ${stamp}`,
      email: `ingresso.portal.${stamp}@opensga.dev`,
      telefone: "(81) 98888-3333",
      cpf,
    });
    await inscricaoPage.fillIngresso({
      dataNascimento: "2002-03-12",
      formaIngresso: "Vestibular",
    });

    const response = await inscricaoPage.submitAndWaitResponse();
    const body = (await response.json()) as {
      acesso: {ra: string; senhaProvisoria: string};
    };
    expect(body.acesso.ra).toMatch(/^2026\d{6}$/);

    await page.context().clearCookies();
    await loginAlunoPage.goto();
    await loginAlunoPage.loginAndWait(body.acesso.ra, body.acesso.senhaProvisoria);
    await expect(page).toHaveURL(/\/area-aluno\/dashboard/);
    await expect(page.getByText(new RegExp(body.acesso.ra)).first()).toBeVisible();
    await expect(page.getByText(/pré-matriculado|engenharia de software/i).first()).toBeVisible();
  });
});
