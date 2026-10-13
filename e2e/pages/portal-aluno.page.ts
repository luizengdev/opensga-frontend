import type {Locator, Page} from "@playwright/test";

export class PortalAlunoPage {
  readonly page: Page;
  readonly navNotas: Locator;
  readonly navDocumentos: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navNotas = page.getByRole("link", {name: /notas e frequência/i});
    this.navDocumentos = page.getByRole("link", {name: /emissão de documentos/i});
  }

  async gotoDashboard() {
    await this.page.goto("/area-aluno/dashboard");
  }

  async gotoNotas() {
    await this.page.goto("/area-aluno/notas");
  }

  async gotoDocumentos() {
    await this.page.goto("/area-aluno/documentos");
  }

  welcomeHeading(firstName: string) {
    return this.page.getByRole("heading", {
      name: new RegExp(`^olá,\\s*${firstName}$`, "i"),
    });
  }

  disciplinaRow(nome: string) {
    return this.page.getByRole("row").filter({hasText: nome});
  }

  documentoCard(titulo: string) {
    return this.page.locator("div.rounded-xl").filter({
      has: this.page.getByRole("heading", {name: titulo, exact: true}),
    });
  }

  emitirDocumentoButton(titulo: string): Locator {
    return this.documentoCard(titulo).getByRole("button", {name: /visualizar & baixar/i});
  }
}
