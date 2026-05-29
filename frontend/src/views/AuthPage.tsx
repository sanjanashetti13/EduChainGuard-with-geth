import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "jwt-decode";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Signup1 } from "components/ui/signup-1";
import { cn } from "lib/utils";
import { dashboardPathForRole } from "utils/routeForRole";

function apiUrl() {
  return process.env.REACT_APP_API_URL ?? "http://localhost:5000";
}

type AuthMode = "login" | "signup";

export type AuthPageProps = {
  initialMode?: AuthMode;
};

const ROLES = [
  { value: "", label: "Select your role" },
  { value: "admin", label: "Admin" },
  { value: "institute", label: "Institute" },
  { value: "verifier", label: "Verifier" },
];

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-foreground"
    >
      {children}
    </label>
  );
}

const selectCn =
  "flex h-10 w-full rounded-md border border-zinc-700/90 bg-zinc-950/60 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showSignupPw2, setShowSignupPw2] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const [pendingGoogle, setPendingGoogle] = useState<{
    token: string;
    email: string;
    displayName: string;
  } | null>(null);
  const [gRole, setGRole] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleErrModal, setGoogleErrModal] = useState("");

  const loginValid =
    loginEmail.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(loginEmail) &&
    loginPassword.length >= 1;

  const signupValid =
    name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(signupEmail) &&
    signupPassword.length >= 6 &&
    signupPassword === confirmPassword &&
    role.length > 0;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setInfo("");
    if (!loginValid) return;
    setBusy(true);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/manual-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          typeof data?.error === "string" ? data.error : "Unable to sign in."
        );
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(dashboardPathForRole(data.user.role), { replace: true });
    } catch {
      setErr("Network error. Is the API running?");
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setInfo("");
    if (!signupValid) return;
    if (signupPassword !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/manual-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          typeof data?.error === "string"
            ? data.error
            : "Could not create account."
        );
        return;
      }
      setInfo("Account created. You can sign in now.");
      setMode("login");
      setLoginEmail(signupEmail.trim());
      setName("");
      setSignupEmail("");
      setSignupPassword("");
      setConfirmPassword("");
      setRole("");
    } catch {
      setErr("Network error. Is the API running?");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setErr("");
      setInfo("");
      setGoogleBusy(true);
      try {
        const res = await fetch(`${apiUrl()}/api/auth/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credential }),
        });
        const data = await res.json().catch(() => ({}));

        if (mode === "login") {
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
          return;
        }

        if (mode === "signup") {
          if (res.ok && data.newUser) {
            const decoded = jwtDecode<
              JwtPayload & { email?: string; name?: string }
            >(credential);
            setGRole("");
            setGoogleErrModal("");
            setPendingGoogle({
              token: credential,
              email: decoded.email ?? "",
              displayName: decoded.name ?? "",
            });
            return;
          }
          if (res.ok && data.user) {
            setErr(
              "This Google account already has a profile. Sign in instead."
            );
            setMode("login");
            return;
          }
          setErr(
            typeof data?.error === "string"
              ? data.error
              : "Google onboarding failed."
          );
        }
      } catch {
        setErr("Could not reach the API.");
      } finally {
        setGoogleBusy(false);
      }
    },
    [mode, navigate]
  );

  const completeGoogleRegister = async () => {
    if (!pendingGoogle || !gRole) return;
    setGoogleErrModal("");
    setGoogleBusy(true);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/google-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: pendingGoogle.token, role: gRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGoogleErrModal(
          typeof data?.error === "string"
            ? data.error
            : "Could not finalize Google signup."
        );
        return;
      }
      setPendingGoogle(null);
      setGRole("");
      setInfo("Google account registered. Sign in with Google.");
      setMode("login");
    } catch {
      setGoogleErrModal("Network error completing Google signup.");
    } finally {
      setGoogleBusy(false);
    }
  };

  const toggleMode = (next: AuthMode) => {
    setErr("");
    setInfo("");
    setMode(next);
  };

  const tabs = (
    <div className="mx-auto flex w-full max-w-sm rounded-full border border-zinc-700/90 bg-zinc-900/80 p-1">
      <button
        type="button"
        onClick={() => toggleMode("login")}
        className={cn(
          "flex-1 rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          mode === "login"
            ? "bg-zinc-100 text-zinc-950 shadow-sm hover:bg-zinc-200"
            : "text-zinc-400 hover:text-zinc-200"
        )}
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => toggleMode("signup")}
        className={cn(
          "flex-1 rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          mode === "signup"
            ? "bg-zinc-100 text-zinc-950 shadow-sm hover:bg-zinc-200"
            : "text-zinc-400 hover:text-zinc-200"
        )}
      >
        Sign up
      </button>
    </div>
  );

  const alerts =
    info || err ? (
      <>
        {info ? (
          <p
            role="status"
            className="w-full rounded-lg border border-emerald-700/50 bg-emerald-950/40 px-3 py-2.5 text-sm text-emerald-100"
          >
            {info}
          </p>
        ) : null}
        {err ? (
          <p
            role="alert"
            className="w-full rounded-lg border border-red-800/60 bg-red-950/40 px-3 py-2.5 text-sm text-red-200"
          >
            {err}
          </p>
        ) : null}
      </>
    ) : null;

  const footer = (
    <div className="text-center text-sm text-muted-foreground">
      {mode === "login" ? (
        <>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => toggleMode("signup")}
            className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Sign up
          </button>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => toggleMode("login")}
            className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Sign in
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <Signup1
        heading={mode === "login" ? "Welcome back" : "Create your account"}
        subheading={
          mode === "login"
            ? "Use your institute email and password or continue with Google."
            : "Minimum 6 characters for password. Choose your role to finish."
        }
        googleText={
          mode === "login" ? "Sign in with Google" : "Sign up with Google"
        }
        tabs={tabs}
        alerts={alerts}
        googleSlot={
          <GoogleLogin
            onSuccess={(response) => {
              if (response.credential)
                void handleGoogleCredential(response.credential);
            }}
            onError={() =>
              setErr("Google Sign-In was cancelled or unavailable.")
            }
            type="standard"
            theme="outline"
            size="large"
            shape="pill"
            text={mode === "login" ? "signin_with" : "signup_with"}
            width="100%"
            useOneTap={false}
            containerProps={{
              className:
                "w-full flex justify-stretch [&>div]:flex [&>div]:w-full [&>div]:justify-center",
            }}
          />
        }
        footer={footer}
      >
        {mode === "login" ? (
          <form className="space-y-4" onSubmit={handleManualLogin} noValidate>
            <div>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@institution.edu"
                className="border-zinc-700/90 bg-zinc-950/60"
              />
            </div>
            <div>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="login-password"
                  name="password"
                  type={showLoginPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-zinc-700/90 bg-zinc-950/60 pr-11"
                />
                <button
                  type="button"
                  aria-label={
                    showLoginPw ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowLoginPw((v) => !v)}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showLoginPw ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="mt-2 h-11 w-full"
              disabled={!loginValid || busy || googleBusy}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSignup} noValidate>
            <div>
              <FieldLabel htmlFor="su-name">Full name</FieldLabel>
              <Input
                id="su-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="border-zinc-700/90 bg-zinc-950/60"
              />
            </div>
            <div>
              <FieldLabel htmlFor="su-email">Email</FieldLabel>
              <Input
                id="su-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="you@institution.edu"
                className="border-zinc-700/90 bg-zinc-950/60"
              />
            </div>
            <div>
              <FieldLabel htmlFor="su-role">Role</FieldLabel>
              <select
                id="su-role"
                name="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={selectCn}
              >
                {ROLES.map((opt) => (
                  <option
                    key={opt.value === "" ? "placeholder" : opt.value}
                    value={opt.value}
                    disabled={opt.value === ""}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="su-password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="su-password"
                  name="password"
                  type={showSignupPw ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="border-zinc-700/90 bg-zinc-950/60 pr-11"
                />
                <button
                  type="button"
                  aria-label={
                    showSignupPw ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowSignupPw((v) => !v)}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showSignupPw ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="su-password2">Confirm password</FieldLabel>
              <div className="relative">
                <Input
                  id="su-password2"
                  name="confirmPassword"
                  type={showSignupPw2 ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="border-zinc-700/90 bg-zinc-950/60 pr-11"
                />
                <button
                  type="button"
                  aria-label={
                    showSignupPw2 ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowSignupPw2((v) => !v)}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showSignupPw2 ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="mt-2 h-11 w-full"
              disabled={!signupValid || busy || googleBusy}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        )}
      </Signup1>

      {(googleBusy || busy) && !pendingGoogle ? (
        <div
          className="pointer-events-none fixed bottom-4 right-4 z-50 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-lg"
          aria-live="polite"
        >
          Working…
        </div>
      ) : null}

      {pendingGoogle ? (
        <div
          className="auth-app fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gfinish-title"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
            <h2 id="gfinish-title" className="text-lg font-semibold">
              Finish Google signup
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pendingGoogle.displayName} · {pendingGoogle.email}
            </p>
            {googleErrModal ? (
              <p className="mt-3 text-sm text-destructive">{googleErrModal}</p>
            ) : null}
            <label
              htmlFor="g-role"
              className="mt-5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Role
            </label>
            <select
              id="g-role"
              value={gRole}
              required
              onChange={(e) => setGRole(e.target.value)}
              className={cn(selectCn, "mt-2")}
            >
              {ROLES.map((opt) => (
                <option
                  key={opt.value || "placeholder"}
                  value={opt.value}
                  disabled={opt.value === ""}
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPendingGoogle(null);
                  setGRole("");
                  setGoogleErrModal("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={!gRole || googleBusy}
                onClick={() => void completeGoogleRegister()}
              >
                {googleBusy ? "Saving…" : "Save role"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
