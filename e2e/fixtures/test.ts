import {test as base, expect} from "@playwright/test";
import {readFileSync} from "node:fs";
import path from "node:path";

import {DashboardAdminPage} from "../pages/dashboard-admin.page";
import {LoginAdminPage} from "../pages/login-admin.page";
import {TurmaDetailPage} from "../pages/turma-detail.page";

interface QuarantineFile {
  tests: string[];
}

const loadQuarantine = (): string[] => {
  try {
    const filePath = path.join(process.cwd(), "playwright", "quarantine.json");
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as QuarantineFile;
    return Array.isArray(parsed.tests) ? parsed.tests : [];
  } catch {
    return [];
  }
};

const quarantined = loadQuarantine();

export const TURMA_ID = "00000000-0000-4000-8000-0000000000t1";
export const TURMA_OUTRA_ID = "00000000-0000-4000-8000-0000000000t2";
export const MATRIZ_OK_ID = "00000000-0000-4000-8000-0000000000m1";
export const MATRIZ_BAIXA_ID = "00000000-0000-4000-8000-0000000000m2";

type Fixtures = {
  loginAdminPage: LoginAdminPage;
  dashboardAdminPage: DashboardAdminPage;
  turmaDetailPage: TurmaDetailPage;
};

export const test = base.extend<Fixtures>({
  loginAdminPage: async ({page}, use) => {
    await use(new LoginAdminPage(page));
  },
  dashboardAdminPage: async ({page}, use) => {
    await use(new DashboardAdminPage(page));
  },
  turmaDetailPage: async ({page}, use) => {
    await use(new TurmaDetailPage(page));
  },
});

test.beforeEach(({}, testInfo) => {
  const hit = quarantined.find((entry) => testInfo.title.includes(entry));
  if (hit) {
    testInfo.annotations.push({type: "quarantine", description: hit});
    test.skip(true, `Em quarentena automática: ${hit}`);
  }
});

export {expect};
