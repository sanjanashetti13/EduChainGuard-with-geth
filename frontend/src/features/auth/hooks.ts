import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authApi, getErrorMessage } from "lib/api";
import type {
  GoogleLoginResponse,
  GoogleRegisterRequest,
  ManualLoginRequest,
  ManualRegisterRequest,
} from "lib/api/types";

import { setAuthUser } from "hooks/useAuth";

function isNewGoogleUser(
  data: GoogleLoginResponse
): data is Extract<GoogleLoginResponse, { newUser: true }> {
  return "newUser" in data && data.newUser === true;
}

export function useManualLoginMutation() {
  return useMutation({
    mutationFn: (body: ManualLoginRequest) => authApi.manualLogin(body),
    onSuccess: (data) => {
      setAuthUser(data.user);
      toast.success("Signed in successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useManualRegisterMutation() {
  return useMutation({
    mutationFn: (body: ManualRegisterRequest) => authApi.manualRegister(body),
    onSuccess: () => {
      toast.success("Account created. You can sign in now.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useGoogleLoginMutation() {
  return useMutation({
    mutationFn: (token: string) => authApi.googleLogin({ token }),
    onSuccess: (data) => {
      if (isNewGoogleUser(data)) {
        return;
      }
      if ("user" in data && data.user) {
        setAuthUser(data.user);
        toast.success("Signed in with Google");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useGoogleRegisterMutation() {
  return useMutation({
    mutationFn: (body: GoogleRegisterRequest) => authApi.googleRegister(body),
    onSuccess: (data) => {
      setAuthUser(data.user);
      toast.success("Google registration complete");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export { isNewGoogleUser };
