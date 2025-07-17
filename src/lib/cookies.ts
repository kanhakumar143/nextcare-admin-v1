"use server";

import { cookies } from "next/headers";

interface CookieOptions {
  path?: string;
  httpOnly?: boolean;
  maxAge?: number;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  expires?: Date;
}

export const setCookie = async (
  name: string,
  value: string,
  options?: CookieOptions
) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name,
    value,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false, // important for localhost, avoid "secure" on HTT
    ...options,
  });
};

export const getCookie = async (name: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
};

export const deleteCookie = async (name: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(name);
};
