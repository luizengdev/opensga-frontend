import {getApiBaseUrl} from "@/lib/api/env";
import {AUTH_COOKIE_NAME} from "@/lib/auth/cookie-name";
import {clearAuthTokenCookie} from "@/lib/auth/clear-auth-cookie";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

interface ApiErrorBody {
  error?: unknown;
  message?: unknown;
}

export const toQueryString = (params?: object) => {
  if (!params) {
    return "";
  }

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });

  const serialized = search.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
};

const readErrorMessage = (payload: unknown, fallback: string) => {
  if (typeof payload !== "object" || payload === null) {
    return fallback;
  }

  const body = payload as ApiErrorBody;

  if (typeof body.error === "string" && body.error.length > 0) {
    return body.error;
  }

  if (typeof body.message === "string" && body.message.length > 0) {
    return body.message;
  }

  return fallback;
};

const getServerAuthHeaders = async (): Promise<HeadersInit> => {
  const {cookies} = await import("next/headers");
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return {};
  }

  return {Authorization: `Bearer ${token}`};
};

const resolveLoginPath = (pathname: string) => {
  if (pathname.startsWith("/area-aluno") || pathname.startsWith("/login-aluno")) {
    return "/login-aluno";
  }

  return "/login-admin";
};

const getRequestPathname = async () => {
  if (typeof window !== "undefined") {
    return window.location.pathname;
  }

  const {headers} = await import("next/headers");
  const headerStore = await headers();
  const nextUrl = headerStore.get("next-url") ?? "";
  const referer = headerStore.get("referer") ?? "";

  try {
    if (referer.length > 0) {
      return new URL(referer).pathname;
    }
  } catch {
    return nextUrl;
  }

  return nextUrl;
};

const redirectToLogin = async () => {
  await clearAuthTokenCookie();
  window.location.assign(resolveLoginPath(window.location.pathname));
};

export const requestApi = async <T>(path: string, init?: RequestInit) => {
  const isBrowser = typeof window !== "undefined";
  const url = isBrowser ? `/api/internal${path}` : `${getApiBaseUrl()}${path}`;
  const authHeaders = isBrowser ? {} : await getServerAuthHeaders();

  const response = await fetch(url, {
    ...init,
    cache: init?.cache ?? "no-store",
    signal: init?.signal ?? AbortSignal.timeout(8000),
    headers: {
      ...(init?.body ? {"Content-Type": "application/json"} : {}),
      ...authHeaders,
      ...init?.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (response.status === 401 && !path.includes("/auth/login")) {
    if (isBrowser) {
      await redirectToLogin();
    } else {
      await clearAuthTokenCookie();
      const {redirect} = await import("next/navigation");
      redirect(resolveLoginPath(await getRequestPathname()));
    }
  }

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      readErrorMessage(payload, "Erro ao processar requisição."),
    );
  }

  return payload as T;
};
