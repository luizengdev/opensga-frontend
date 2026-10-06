"use server";

import {cookies} from "next/headers";

import {AUTH_COOKIE_NAME} from "@/lib/auth/get-session";

export const clearAuthTokenCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
};
