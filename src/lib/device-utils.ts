// ÷Universal Device Detector
export function isMobileUserAgent(
  userAgent: string | null | undefined
): boolean {
  if (!userAgent) return false;
  return /mobile|android|iphone|ipad/i.test(userAgent);
}
