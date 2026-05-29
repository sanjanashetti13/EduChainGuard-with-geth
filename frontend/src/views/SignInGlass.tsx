import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

import { GlassButton } from "components/ui/sign-up";
import { dashboardPathForRole } from "utils/routeForRole";

import "assets/styles/auth-theme.css";
import "components/ui/sign-up-styles.css";

function apiUrl() {
  return process.env.REACT_APP_API_URL ?? "http://localhost:5000";
}

type SignInGlassProps = {
  onRegisterClick: () => void;
};

export default function SignInGlass({ onRegisterClick }: SignInGlassProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/manual-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          typeof data?.error === "string" ? data.error : "Unable to sign in"
        );
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(dashboardPathForRole(data.user.role), { replace: true });
    } catch {
      setErr("Network error · is Flask running?");
    } finally {
      setBusy(false);
    }
  };

  const googleSuccess = async (response: { credential?: string }) => {
    if (!response.credential) return;
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        setErr(
          typeof data?.error === "string"
            ? data.error
            : "Google account not registered. Create an account first."
        );
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(dashboardPathForRole(data.user.role), { replace: true });
    } catch {
      setErr("Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-app bg-background text-foreground flex min-h-screen w-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-light tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with Google or your institute email.
          </p>
        </div>

        <div className="flex justify-center [&>div]:inline-flex">
          <GoogleLogin
            onSuccess={googleSuccess}
            onError={() => setErr("Google error")}
          />
        </div>

        <div className="flex items-center gap-2">
          <hr className="flex-1 border-border opacity-40" />
          <span className="text-xs font-semibold text-muted-foreground">
            OR
          </span>
          <hr className="flex-1 border-border opacity-40" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {err ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </p>
          ) : null}
          <div className="glass-input-wrap w-full">
            <div className="glass-input py-2">
              <div className="relative z-10 flex w-10 flex-shrink-0 items-center justify-center pl-2">
                <Mail className="h-5 w-5 text-foreground/70" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="relative z-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
          <div className="glass-input-wrap w-full">
            <div className="glass-input py-2">
              <div className="relative z-10 flex w-10 flex-shrink-0 items-center justify-center pl-2">
                {password.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="text-foreground/70 hover:text-foreground"
                  >
                    {show ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                ) : (
                  <Lock className="h-5 w-5 text-foreground/70" />
                )}
              </div>
              <input
                type={show ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="relative z-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
          <GlassButton
            type="submit"
            disabled={busy}
            className="w-full justify-center"
            contentClassName="w-full text-center"
          >
            {busy ? "Signing in…" : "Sign in"}
          </GlassButton>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New to EduChainGuard?{" "}
          <button
            type="button"
            onClick={onRegisterClick}
            className="font-semibold text-primary underline-offset-4 hover:text-primary/80 hover:underline"
          >
            Create account
          </button>
        </p>
      </motion.div>
    </div>
  );
}
