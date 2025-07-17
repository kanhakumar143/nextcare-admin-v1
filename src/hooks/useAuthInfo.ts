"use client";

import { useSelector } from "react-redux";
import { getLocalStorage } from "@/utils/localStorage";
import { RootState } from "@/store";

export const useAuthInfo = () => {
  const {
    user_id: reduxUserId,
    access_token: reduxAccessToken,
    user_role: reduxRole,
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

  return {
    userId,
    role,
    accessToken,
  };
};
