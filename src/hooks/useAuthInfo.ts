"use client";

import { useSelector } from "react-redux";
import { getLocalStorage } from "@/utils/localStorage";
import { RootState } from "@/store";

export const useAuthInfo = () => {
  const {
    user_id: reduxUserId,
    access_token: reduxAccessToken,
    user_role: reduxRole,
    org_id: reduxOrgId,
    practitioner_id: reduxPractitionerId,
  } = useSelector((state: RootState) => state.auth.userLoginDetails);

  const userId = reduxUserId
    ? reduxUserId
    : (getLocalStorage("user_id") as string | null);
  const accessToken = reduxAccessToken
    ? reduxAccessToken
    : (getLocalStorage("access_token") as string | null);
  const role = reduxRole
    ? reduxRole
    : (getLocalStorage("role") as string | null);
  const orgId = reduxOrgId
    ? reduxOrgId
    : (getLocalStorage("org_id") as string | null);
  const practitionerId = reduxPractitionerId
    ? reduxPractitionerId
    : (getLocalStorage("practitioner_id") as string | null);

  return {
    userId,
    role,
    practitionerId,
    accessToken,
    orgId,
  };
};
