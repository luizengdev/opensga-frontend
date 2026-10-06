import {cookies} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

import {getApiBaseUrl} from "@/lib/api/env";
import {AUTH_COOKIE_NAME} from "@/lib/auth/cookie-name";

const ALLOWED_METHODS = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);

const proxyToApi = async (request: NextRequest, pathSegments: string[]) => {
  const method = request.method.toUpperCase();

  if (!ALLOWED_METHODS.has(method)) {
    return NextResponse.json({error: "Método não permitido."}, {status: 405});
  }

  const upstreamPath = `/${pathSegments.join("/")}`;

  if (!upstreamPath.startsWith("/api/")) {
    return NextResponse.json({error: "Caminho inválido."}, {status: 400});
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const search = request.nextUrl.search;
  const body =
    method === "GET" || method === "DELETE" ? undefined : await request.text();
  const payloadBody = body && body.length > 0 ? body : undefined;

  const response = await fetch(`${getApiBaseUrl()}${upstreamPath}${search}`, {
    method,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: {
      ...(payloadBody ? {"Content-Type": "application/json"} : {}),
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    body: payloadBody,
  });

  const payload = await response.text();

  return new NextResponse(payload, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
};

export const GET = async (
  request: NextRequest,
  context: {params: Promise<{path: string[]}>},
) => {
  const {path} = await context.params;
  return proxyToApi(request, path);
};

export const POST = GET;
export const PATCH = GET;
export const PUT = GET;
export const DELETE = GET;
