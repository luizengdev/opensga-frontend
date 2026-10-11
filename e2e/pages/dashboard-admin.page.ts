import type {Locator, Page} from "@playwright/test";

export class DashboardAdminPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading").first();
  }

  async goto() {
    await this.page.goto("/area-admin/dashboard");
  }
}
