import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

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
import { Separator } from "components/ui/separator";
import { useFormWithSchema } from "hooks/useFormWithSchema";
import { dashboardPathForRole } from "utils/routeForRole";
import { toast } from "sonner";

import { loginSchema, type LoginFormValues } from "./schemas";
import {
  isNewGoogleUser,
  useGoogleLoginMutation,
  useManualLoginMutation,
} from "./hooks";

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useManualLoginMutation();
  const googleMutation = useGoogleLoginMutation();

  const form = useFormWithSchema(loginSchema, {
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          navigate(dashboardPathForRole(data.user.role));
        },
      }
    );
  };

  const handleGoogleSuccess = (response: { credential?: string }) => {
    if (!response.credential) {
      toast.error("Google sign-in failed");
      return;
    }
    googleMutation.mutate(response.credential, {
      onSuccess: (data) => {
        if (isNewGoogleUser(data)) {
          toast.info("Complete registration to choose your role.", {
            description: "Redirecting to sign up…",
          });
          navigate("/auth/register", {
            state: { googleEmail: data.email, googleName: data.name },
          });
          return;
        }
        if ("user" in data && data.user) {
          navigate(dashboardPathForRole(data.user.role));
        }
      },
    });
  };

  const busy = loginMutation.isPending || googleMutation.isPending;

  return (
    <AuthFormCard
      title="Welcome back"
      description="Sign in to manage certificates on EduChainGuard"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">Continue with Google</p>
        <div className="flex justify-center [&>div]:!w-full [&>div]:flex [&>div]:justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google sign-in was cancelled or failed")}
            theme="filled_black"
            size="large"
            text="signin_with"
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
            Or continue with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={busy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={busy}>
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
