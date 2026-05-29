export type UserRole = "admin" | "institute" | "verifier" | string;

export type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
};

export type ManualLoginRequest = {
  email: string;
  password: string;
};

export type ManualLoginResponse = {
  message: string;
  user: AuthUser;
};

export type ManualRegisterRequest = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type ManualRegisterResponse = {
  message: string;
};

export type GoogleLoginRequest = {
  token: string;
};

export type GoogleLoginExistingResponse = {
  message?: string;
  user: AuthUser;
};

export type GoogleLoginNewUserResponse = {
  newUser: true;
  name: string;
  email: string;
  token: string;
};

export type GoogleLoginResponse =
  | GoogleLoginExistingResponse
  | GoogleLoginNewUserResponse;

export type GoogleRegisterRequest = {
  token: string;
  role: UserRole;
};

export type GoogleRegisterResponse = {
  message: string;
  user: AuthUser;
};

export type RecordUploadRequest = {
  email: string;
  tx_hash: string;
  hash: string;
  filename?: string;
};

export type RecordVerifyRequest = {
  email: string;
  hash: string;
  verified: boolean;
};

export type AdminStats = {
  totalUploads: number;
  totalVerified: number;
  users: {
    admin: number;
    institute: number;
    verifier: number;
  };
  recent: Array<{
    email: string;
    filename: string;
    hash: string;
    tx_hash: string;
  }>;
};

export type UploadsPerDayPoint = {
  date: string;
  count: number;
};

export type InstituteUploadMeta = {
  filename: string;
  hash: string;
  tx_hash: string;
  timestamp?: string;
};

export type UserActivityRow = {
  name: string;
  email: string;
  role: UserRole;
  uploads?: InstituteUploadMeta[];
  verifications?: Array<{ hash: string; verified?: boolean; timestamp?: string }>;
};

export type UserActivityResponse = {
  admin: UserActivityRow[];
  institute: UserActivityRow[];
  verifier: UserActivityRow[];
};

export type VerifierActivityResponse = {
  verifier: Array<
    UserActivityRow & {
      verifications: Array<{
        email?: string;
        hash: string;
        verified: boolean;
        timestamp?: string;
      }>;
    }
  >;
};

export type PinataUploadResponse = {
  success: boolean;
  cid?: string;
  url?: string;
  error?: string;
};

export type MessageResponse = {
  message: string;
};
