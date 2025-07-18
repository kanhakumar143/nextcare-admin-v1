"use server";

import { headers } from "next/headers";
import { isMobileUserAgent } from "./device-utils";

export async function getServerDeviceType(): Promise<"mobile" | "desktop"> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  return isMobileUserAgent(userAgent) ? "mobile" : "desktop";
}
