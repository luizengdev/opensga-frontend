import type {Locator, Page} from "@playwright/test";

export class MatriculasAdminPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {name: /gestão de matrículas e ras/i});
    this.searchInput = page.getByPlaceholder(/buscar por ra/i);
  }

  async goto() {
    await this.page.goto("/area-admin/matriculas");
  }

  async filterByStatus(label: string) {
    await this.page.getByRole("combobox").filter({hasText: /status/i}).click();
    await this.page.getByRole("option", {name: label, exact: true}).click();
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }

  rowByRa(ra: string) {
    return this.page.getByRole("row").filter({hasText: ra});
  }
}
