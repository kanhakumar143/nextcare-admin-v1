export interface generateAccessTokenPayload {
  user_id: string | null;
  user_type: string | null;
}

export interface authSliceInitialState {
  userLoginDetails: userLoginTypes;
}

export interface userLoginTypes {
  user_id: string | null;
  user_role: string | null;
  access_token: string | null;
  org_id?: string | null;
}
