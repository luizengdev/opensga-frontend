import type {Page} from "@playwright/test";

export interface MockLoginUser {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  role: "ADMIN" | "PROFESSOR" | "ALUNO" | "RESPONSAVEL";
  avatarUrl: string | null;
}

const encodeJwt = (payload: Record<string, unknown>) => {
  const header = Buffer.from(JSON.stringify({alg: "none", typ: "JWT"})).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.e2e`;
};

export const mockLoginSuccess = async (
  page: Page,
  user: MockLoginUser,
) => {
  const token = encodeJwt({
    sub: user.id,
    role: user.role,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 20 * 60,
  });

  await page.route("**/api/internal/api/v1/auth/login", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({token, user}),
    });
  });
};

export const mockLoginUnauthorized = async (page: Page, message = "Credenciais inválidas") => {
  await page.route("**/api/internal/api/v1/auth/login", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({error: message}),
    });
  });
};
