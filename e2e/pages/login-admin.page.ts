import type {Locator, Page} from "@playwright/test";

export class LoginAdminPage {
  readonly page: Page;
  readonly identificadorInput: Locator;
  readonly senhaInput: Locator;
  readonly submitButton: Locator;
  readonly formError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.identificadorInput = page.getByRole("textbox", {
      name: /e-mail, cpf ou matrícula/i,
    });
    this.senhaInput = page.getByLabel(/^senha$/i);
    this.submitButton = page.getByRole("button", {name: /^entrar$/i});
    this.formError = page.locator("p.text-destructive");
  }

  async goto() {
    await this.page.goto("/login-admin");
  }

  async fillCredentials(identificador: string, senha: string) {
    await this.identificadorInput.fill(identificador);
    await this.senhaInput.fill(senha);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(identificador: string, senha: string) {
    await this.fillCredentials(identificador, senha);
    await this.submit();
  }

  async loginAndWait(identificador: string, senha: string) {
    await this.fillCredentials(identificador, senha);
    await Promise.all([
      this.page.waitForURL(/\/area-admin\//, {timeout: 30_000}),
      this.submit(),
    ]);
  }
}
