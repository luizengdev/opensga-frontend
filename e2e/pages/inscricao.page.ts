import type {Locator, Page} from "@playwright/test";

export class InscricaoPage {
  readonly page: Page;
  readonly successHeading: Locator;
  readonly concluirButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successHeading = page.getByRole("heading", {name: /inscrição recebida/i});
    this.concluirButton = page.getByRole("button", {name: /concluir inscrição/i});
  }

  async goto() {
    await this.page.goto("/inscricao");
  }

  async chooseCurso(nome: string) {
    await this.page.getByRole("heading", {name: nome, exact: true}).waitFor();
    await this.page.getByRole("button", {name: /saiba mais/i}).click();
    await this.page.waitForURL("**/inscricao/**");
  }

  async openFormulario() {
    const panel = this.page.getByRole("main");
    await panel.getByRole("button", {name: /ver minha oferta/i}).click();
    await panel.getByRole("button", {name: /^inscreva-se$/i}).click();
    await this.page.getByRole("heading", {name: /complete seu cadastro/i}).waitFor();
  }

  async fillCadastro(input: {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
  }) {
    await this.page.getByLabel(/^nome$/i).fill(input.nome);
    await this.page.getByLabel(/e-mail principal/i).fill(input.email);
    await this.page.getByLabel(/celular com ddd/i).fill(input.telefone);
    await this.page.getByLabel(/^cpf$/i).fill(input.cpf);
    await this.page
      .getByText(/li e aceito a política de privacidade/i)
      .locator("..")
      .getByRole("button")
      .click();
    await this.page.getByRole("button", {name: /^continuar$/i}).click();
  }

  async fillIngresso(input: {dataNascimento: string; formaIngresso: string}) {
    await this.page.getByLabel(/data de nascimento/i).fill(input.dataNascimento);
    await this.page
      .getByRole("button", {name: new RegExp(`^${input.formaIngresso}\\b`, "i")})
      .click();
  }

  async submit() {
    await this.concluirButton.click();
  }

  async submitAndWaitResponse() {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes("/api/inscricao") && res.request().method() === "POST",
      ),
      this.submit(),
    ]);
    return response;
  }

  raCredential() {
    return this.page.locator("span.font-mono").filter({hasText: /^2026\d{6}$/});
  }
}
