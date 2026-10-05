import {getApiBaseUrl} from "@/lib/api/env";

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

export const requestApi = async <T>(path: string, init?: RequestInit) => {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(8000),
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      readErrorMessage(payload, "Erro ao processar requisição."),
    );
  }

  return payload as T;
};
