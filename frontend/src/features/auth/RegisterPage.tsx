import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import AuthFormCard from "components/auth/AuthFormCard";
import { Button } from "components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";
import { Input } from "components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Separator } from "components/ui/separator";
import { useFormWithSchema } from "hooks/useFormWithSchema";
import { dashboardPathForRole } from "utils/routeForRole";

import {
  googleRoleSchema,
  registerSchema,
  USER_ROLES,
  type GoogleRoleFormValues,
  type RegisterFormValues,
} from "./schemas";
import {
  isNewGoogleUser,
  useGoogleLoginMutation,
  useGoogleRegisterMutation,
  useManualRegisterMutation,
} from "./hooks";

type LocationState = {
  googleEmail?: string;
  googleName?: string;
};

const ROLE_LABELS: Record<(typeof USER_ROLES)[number], string> = {
  admin: "Admin",
  institute: "Institute",
  verifier: "Verifier",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleProfile, setGoogleProfile] = useState<{
    name: string;
    email: string;
  } | null>(
    state.googleEmail
      ? { name: state.googleName ?? "", email: state.googleEmail }
      : null
  );

  const registerMutation = useManualRegisterMutation();
  const googleLoginMutation = useGoogleLoginMutation();
  const googleRegisterMutation = useGoogleRegisterMutation();

  const form = useFormWithSchema(registerSchema, {
    defaultValues: {
      name: state.googleName ?? "",
      email: state.googleEmail ?? "",
      password: "",
      confirmPassword: "",
      role: "institute" as RegisterFormValues["role"],
    },
  });

  const googleRoleForm = useFormWithSchema(googleRoleSchema, {
    defaultValues: { role: "institute" as GoogleRoleFormValues["role"] },
  });

  const onManualSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      },
      {
        onSuccess: () => navigate("/auth/login"),
      }
    );
  };

  const handleGoogleSuccess = (response: { credential?: string }) => {
    if (!response.credential) {
      toast.error("Google sign-in failed");
      return;
    }
    const decoded = jwtDecode<{ name?: string; email?: string }>(
      response.credential
    );
    googleLoginMutation.mutate(response.credential, {
      onSuccess: (data) => {
        if (isNewGoogleUser(data)) {
          setGoogleToken(response.credential!);
          setGoogleProfile({
            name: data.name ?? decoded.name ?? "",
            email: data.email ?? decoded.email ?? "",
          });
          return;
        }
        if ("user" in data && data.user) {
          toast.info("Account already exists. Please sign in.");
          navigate("/auth/login");
        }
      },
    });
  };

  const onGoogleRoleSubmit = (values: GoogleRoleFormValues) => {
    if (!googleToken) return;
    googleRegisterMutation.mutate(
      { token: googleToken, role: values.role },
      {
        onSuccess: (data) => {
          navigate(dashboardPathForRole(data.user.role));
        },
      }
    );
  };

  const busy =
    registerMutation.isPending ||
    googleLoginMutation.isPending ||
    googleRegisterMutation.isPending;

  if (googleProfile && googleToken) {
    return (
      <AuthFormCard
        title="Choose your role"
        description={`Finish Google sign-up for ${googleProfile.email}`}
        footer={
          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/auth/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        }
      >
        <Form {...googleRoleForm}>
          <form
            onSubmit={googleRoleForm.handleSubmit(onGoogleRoleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={googleRoleForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={busy}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={busy}>
              {googleRegisterMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Complete registration"
              )}
            </Button>
          </form>
        </Form>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      title="Create an account"
      description="Register to upload or verify academic certificates"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">Sign up with Google</p>
        <div className="flex justify-center [&>div]:!w-full [&>div]:flex [&>div]:justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google sign-up was cancelled or failed")}
            theme="filled_black"
            size="large"
            text="signup_with"
            shape="rectangular"
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or register with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onManualSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Institute" disabled={busy} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@institute.edu"
                    autoComplete="email"
                    disabled={busy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    disabled={busy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    disabled={busy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={busy}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={busy}>
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
