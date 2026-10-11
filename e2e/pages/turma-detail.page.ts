import type {Locator, Page} from "@playwright/test";

export class TurmaDetailPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly lancarButton: Locator;
  readonly fecharSemestreButton: Locator;
  readonly enturmarButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading").first();
    this.lancarButton = page.getByRole("button", {name: /^lançar$/i});
    this.fecharSemestreButton = page.getByRole("button", {name: /fechar semestre/i});
    this.enturmarButton = page.getByRole("button", {name: /enturmar aluno/i});
  }

  async goto(turmaId: string) {
    await this.page.goto(`/area-admin/turmas/${turmaId}`);
    await this.page.getByText("CALC1-2026.2").waitFor({state: "visible", timeout: 30_000});
  }

  async openAvaliacao() {
    await this.lancarButton.first().click();
  }

  async fillNotas(av: string, avs: string, faltas = "0") {
    await this.page.getByLabel(/av \(0 a 10\)/i).fill(av);
    await this.page.getByLabel(/avs \(0 a 10\)/i).fill(avs);
    await this.page.getByLabel(/total de faltas/i).fill(faltas);
  }

  async saveAvaliacao() {
    await this.page.getByRole("button", {name: /consolidar lançamento/i}).click();
  }
}
