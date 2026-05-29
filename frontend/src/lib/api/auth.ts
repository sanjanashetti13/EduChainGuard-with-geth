import { apiRequest } from "./client";
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
  GoogleRegisterRequest,
  GoogleRegisterResponse,
  ManualLoginRequest,
  ManualLoginResponse,
  ManualRegisterRequest,
  ManualRegisterResponse,
} from "./types";

export const authApi = {
  manualLogin: (body: ManualLoginRequest) =>
    apiRequest<ManualLoginResponse>("/api/auth/manual-login", {
      method: "POST",
      body,
    }),

  manualRegister: (body: ManualRegisterRequest) =>
    apiRequest<ManualRegisterResponse>("/api/auth/manual-register", {
      method: "POST",
      body,
    }),

  googleLogin: (body: GoogleLoginRequest) =>
    apiRequest<GoogleLoginResponse>("/api/auth/google-login", {
      method: "POST",
      body,
    }),

  googleRegister: (body: GoogleRegisterRequest) =>
    apiRequest<GoogleRegisterResponse>("/api/auth/google-register", {
      method: "POST",
      body,
    }),
};
