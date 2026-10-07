"use server";

import dayjs from "dayjs";
import {cookies} from "next/headers";

import {AUTH_COOKIE_NAME, getAuthTokenExpiry} from "@/lib/auth/get-session";

export const setAuthTokenCookie = async (token: string) => {
  const expiry = getAuthTokenExpiry(token);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiry?.toDate() ?? dayjs().add(20, "minute").toDate(),
  });
};
