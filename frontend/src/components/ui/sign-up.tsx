import { cn } from "lib/utils";
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  createContext,
  Children,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ArrowRight,
  Mail,
  Gem,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  AlertCircle,
  PartyPopper,
  Loader,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  type Variants,
  type Transition,
} from "framer-motion";
import type { ReactNode } from "react";
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from "canvas-confetti";
import confetti from "canvas-confetti";

import "./sign-up-styles.css";
import "assets/styles/auth-theme.css";

type ApiConfetti = { fire: (options?: ConfettiOptions) => void };
export type ConfettiRef = ApiConfetti | null;
const ConfettiContext = createContext<ApiConfetti>({} as ApiConfetti);

const Confetti = forwardRef<
  ConfettiRef,
  React.ComponentPropsWithRef<"canvas"> & {
    options?: ConfettiOptions;
    globalOptions?: ConfettiGlobalOptions;
    manualstart?: boolean;
  }
>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    ...rest
  } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);
  const canvasRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (node !== null) {
        if (instanceRef.current) return;
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      } else if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    },
    [globalOptions]
  );

  const fire = useCallback(
    (opts: ConfettiOptions = {}) =>
      instanceRef.current?.({ ...options, ...opts }),
    [options]
  );

  const api = useMemo(() => ({ fire }), [fire]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!manualstart) fire();
  }, [manualstart, fire]);

  return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = "Confetti";

export { ConfettiContext };

type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  stopOnEnd?: boolean;
};

export function TextLoop({
  children,
  className,
  interval = 2,
  transition = { duration: 0.3 },
  variants,
  onIndexChange,
  stopOnEnd = false,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = window.setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) {
          window.clearInterval(timer);
          return current;
        }
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);

  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <div className={cn("relative inline-block whitespace-nowrap", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          variants={variants ?? motionVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variants;
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
}

function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = true,
  inViewMargin = "-50px",
  blur = "6px",
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, {
    once: true,
    margin: (inViewMargin || "-50px") as `${number}px`,
  });
  const isInView = !inView || inViewResult;

  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: "blur(0px)" },
  };
  const combinedVariants = variant ?? defaultVariants;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      exit="hidden"
      variants={combinedVariants}
      transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const glassButtonVariants = cva(
  "relative isolate cursor-pointer rounded-full transition-all appearance-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
  {
    variants: {
      size: {
        default: "text-base font-medium",
        sm: "text-sm font-medium",
        lg: "text-lg font-medium",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { size: "default" },
  }
);

const glassButtonTextVariants = cva(
  "glass-button-text relative block select-none tracking-tighter",
  {
    variants: {
      size: {
        default: "px-6 py-3.5",
        sm: "px-4 py-2",
        lg: "px-8 py-4",
        icon: "flex h-10 w-10 items-center justify-center",
      },
    },
    defaultVariants: { size: "default" },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  contentClassName?: string;
}

export const GlassButton = React.forwardRef<
  HTMLButtonElement,
  GlassButtonProps
>(
  (
    { className, children, size, contentClassName, onClick, type = "button", ...props },
    ref
  ) => {
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const button = e.currentTarget.querySelector("button");
      if (button && e.target !== button) button.click();
    };
    return (
      <div
        className={cn(
          "glass-button-wrap cursor-pointer rounded-full relative",
          className
        )}
        onClick={handleWrapperClick}
      >
        <button
          type={type}
          className={cn(
            "glass-button relative z-10",
            glassButtonVariants({ size })
          )}
          ref={ref}
          onClick={onClick}
          {...props}
        >
          <span
            className={cn(glassButtonTextVariants({ size }), contentClassName)}
          >
            {children}
          </span>
        </button>
        <div className="glass-button-shadow rounded-full pointer-events-none" />
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

const GradientBackground = () => (
  <>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute top-0 left-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="rev_grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "var(--color-primary)", stopOpacity: 0.8 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "var(--color-chart-3)", stopOpacity: 0.6 }}
          />
        </linearGradient>
        <linearGradient id="rev_grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "var(--color-chart-4)", stopOpacity: 0.9 }}
          />
          <stop
            offset="50%"
            style={{ stopColor: "var(--color-secondary)", stopOpacity: 0.7 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "var(--color-chart-1)", stopOpacity: 0.6 }}
          />
        </linearGradient>
        <radialGradient id="rev_grad3" cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            style={{ stopColor: "var(--destructive)", stopOpacity: 0.8 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "var(--color-chart-5)", stopOpacity: 0.4 }}
          />
        </radialGradient>
        <filter id="rev_blur1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="35" />
        </filter>
        <filter id="rev_blur2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="25" />
        </filter>
        <filter id="rev_blur3" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="45" />
        </filter>
      </defs>
      <g style={{ animation: "auth-float1 20s ease-in-out infinite" }}>
        <ellipse
          cx="200"
          cy="500"
          rx="250"
          ry="180"
          fill="url(#rev_grad1)"
          filter="url(#rev_blur1)"
          transform="rotate(-30 200 500)"
        />
        <rect
          x="500"
          y="100"
          width="300"
          height="250"
          rx="80"
          fill="url(#rev_grad2)"
          filter="url(#rev_blur2)"
          transform="rotate(15 650 225)"
        />
      </g>
      <g style={{ animation: "auth-float2 25s ease-in-out infinite" }}>
        <circle
          cx="650"
          cy="450"
          r="150"
          fill="url(#rev_grad3)"
          filter="url(#rev_blur3)"
          opacity={0.7}
        />
        <ellipse
          cx="50"
          cy="150"
          rx="180"
          ry="120"
          fill="var(--color-accent)"
          filter="url(#rev_blur2)"
          opacity={0.8}
        />
      </g>
    </svg>
  </>
);


const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    className="w-6 h-6"
    aria-hidden
  >
    <path
      fill="currentColor"
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
    />
  </svg>
);

const modalSteps = [
  {
    message: "Signing you up...",
    icon: <Loader className="w-12 h-12 text-primary animate-spin" />,
  },
  {
    message: "Onboarding you...",
    icon: <Loader className="w-12 h-12 text-primary animate-spin" />,
  },
  {
    message: "Finalizing...",
    icon: <Loader className="w-12 h-12 text-primary animate-spin" />,
  },
  {
    message: "Welcome Aboard!",
    icon: <PartyPopper className="w-12 h-12 text-green-500" />,
  },
];

const TEXT_LOOP_INTERVAL = 1.5;

const DefaultLogo = () => (
  <div className="bg-primary text-primary-foreground rounded-md p-1.5">
    <Gem className="h-4 w-4" />
  </div>
);

const ROLE_OPTIONS = [
  { value: "", label: "Select role *" },
  { value: "admin", label: "Admin" },
  { value: "institute", label: "Institute" },
  { value: "verifier", label: "Verifier" },
];

function apiUrl() {
  return process.env.REACT_APP_API_URL ?? "http://localhost:5000";
}

interface AuthComponentProps {
  logo?: React.ReactNode;
  brandName?: string;
  googleSlot?: ReactNode;
  onRegistered?: () => void;
}

export const AuthComponent = ({
  logo = <DefaultLogo />,
  brandName = "EduChainGuard",
  googleSlot,
  onRegistered,
}: AuthComponentProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStep, setAuthStep] = useState<
    "email" | "password" | "confirmPassword"
  >("email");
  const [modalStatus, setModalStatus] = useState<
    "closed" | "loading" | "error" | "success"
  >("closed");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const confettiRef = useRef<ConfettiRef>(null);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = confirmPassword.length >= 6;
  const nameOk = name.trim().length >= 2;

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const fireSideCanons = () => {
    const fire = confettiRef.current?.fire;
    if (fire) {
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const particleCount = 50;
      fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
      fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalStatus !== "closed" || authStep !== "confirmPassword") return;

    if (!role) {
      setModalErrorMessage("Choose your role.");
      setModalStatus("error");
      return;
    }

    if (password !== confirmPassword) {
      setModalErrorMessage("Passwords do not match!");
      setModalStatus("error");
      return;
    }

    setModalStatus("loading");
    try {
      const res = await fetch(`${apiUrl()}/api/auth/manual-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email,
          password,
          role,
        }),
      });
      const data = await res.json().catch(() => ({}));

      const loadingStepsCount = modalSteps.length - 1;
      await new Promise<void>((resolve) =>
        window.setTimeout(
          resolve,
          loadingStepsCount * TEXT_LOOP_INTERVAL * 1000
        )
      );

      if (!res.ok) {
        setModalErrorMessage(
          typeof data?.error === "string" ? data.error : "Registration failed"
        );
        setModalStatus("error");
        return;
      }
      fireSideCanons();
      setModalStatus("success");
    } catch {
      setModalErrorMessage("Network error. Is the Flask API running?");
      setModalStatus("error");
    }
  };

  const handleProgressStep = () => {
    if (authStep === "email") {
      if (!nameOk) return;
      if (isEmailValid) setAuthStep("password");
    } else if (authStep === "password") {
      if (isPasswordValid) setAuthStep("confirmPassword");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleProgressStep();
    }
  };

  const handleGoBack = () => {
    if (authStep === "confirmPassword") {
      setAuthStep("password");
      setConfirmPassword("");
    } else if (authStep === "password") setAuthStep("email");
  };

  const closeModal = () => {
    setModalStatus("closed");
    setModalErrorMessage("");
  };

  useEffect(() => {
    if (authStep === "password")
      window.setTimeout(() => passwordInputRef.current?.focus(), 50);
    else if (authStep === "confirmPassword")
      window.setTimeout(() => confirmPasswordInputRef.current?.focus(), 50);
  }, [authStep]);

  useEffect(() => {
    if (modalStatus === "success") fireSideCanons();
  }, [modalStatus]);

  const ModalShell = () => (
    <AnimatePresence>
      {modalStatus !== "closed" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative border-4 rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-2"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            {(modalStatus === "error" || modalStatus === "success") && (
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {modalStatus === "error" && (
              <>
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="text-lg font-medium text-center">
                  {modalErrorMessage}
                </p>
                <GlassButton onClick={closeModal} size="sm" className="mt-4">
                  Try Again
                </GlassButton>
              </>
            )}
            {modalStatus === "loading" && (
              <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd>
                {modalSteps.slice(0, -1).map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    {step.icon}
                    <p className="text-lg font-medium text-center">
                      {step.message}
                    </p>
                  </div>
                ))}
              </TextLoop>
            )}
            {modalStatus === "success" && (
              <div className="flex flex-col items-center gap-4">
                {modalSteps[modalSteps.length - 1].icon}
                <p className="text-lg font-medium">
                  {modalSteps[modalSteps.length - 1].message}
                </p>
                <GlassButton
                  size="sm"
                  type="button"
                  className="mt-2"
                  onClick={() => {
                    closeModal();
                    onRegistered?.();
                  }}
                >
                  Continue to login
                </GlassButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="auth-app bg-background text-foreground min-h-screen w-screen flex flex-col">
      <Confetti
        ref={confettiRef}
        manualstart
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]"
      />
      <ModalShell />

      <div className="fixed top-4 left-4 z-20 md:left-1/2 md:-translate-x-1/2 flex items-center gap-2">
        {logo}
        <h1 className="text-base font-bold text-foreground">{brandName}</h1>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-card relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <GradientBackground />
        </div>

        <fieldset
          disabled={modalStatus !== "closed"}
          className="relative z-10 flex flex-col items-center gap-8 w-[min(100%,320px)] mx-auto px-4"
        >
          <AnimatePresence mode="wait">
            {authStep === "email" && (
              <motion.div
                key="email-content"
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full flex flex-col items-center gap-4"
              >
                <BlurFade delay={0.25} className="w-full">
                  <div className="text-center">
                    <p className="font-serif font-light text-3xl sm:text-4xl tracking-tight text-foreground whitespace-nowrap">
                      Get started
                    </p>
                  </div>
                </BlurFade>
                <BlurFade delay={0.35}>
                  <p className="text-sm font-medium text-muted-foreground">
                    Continue with
                  </p>
                </BlurFade>
                <BlurFade delay={0.45}>
                  <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 w-full max-w-[300px]">
                    {googleSlot ? (
                      <div className="flex justify-center">{googleSlot}</div>
                    ) : null}
                    <GlassButton
                      type="button"
                      size="sm"
                      contentClassName="flex items-center justify-center gap-2"
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    >
                      <GitHubIcon />
                      <span className="font-semibold text-foreground">
                        GitHub
                      </span>
                    </GlassButton>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground mt-2">
                    GitHub is not wired to this EduChainGuard API yet.
                  </p>
                </BlurFade>
                <BlurFade delay={0.55} className="w-[300px] max-w-full">
                  <div className="flex items-center w-full gap-2 py-2">
                    <hr className="w-full opacity-40" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      OR
                    </span>
                    <hr className="w-full opacity-40" />
                  </div>
                </BlurFade>
              </motion.div>
            )}
            {authStep === "password" && (
              <motion.div
                key="password-title"
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full flex flex-col items-center text-center gap-4"
              >
                <BlurFade className="w-full">
                  <p className="font-serif font-light text-3xl sm:text-4xl tracking-tight text-foreground">
                    Secure password
                  </p>
                </BlurFade>
                <BlurFade delay={0.2}>
                  <p className="text-sm font-medium text-muted-foreground px-4">
                    At least six characters — this is hashed on the Flask API with bcrypt.
                  </p>
                </BlurFade>
              </motion.div>
            )}
            {authStep === "confirmPassword" && (
              <motion.div
                key="confirm-title"
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full flex flex-col items-center text-center gap-4"
              >
                <BlurFade className="w-full">
                  <p className="font-serif font-light text-3xl sm:text-4xl tracking-tight text-foreground">
                    Confirm & role
                  </p>
                </BlurFade>
                <BlurFade delay={0.2}>
                  <p className="text-sm font-medium text-muted-foreground px-4">
                    Pick how you participate in EduChainGuard.
                  </p>
                </BlurFade>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleFinalSubmit} className="w-[300px] max-w-full space-y-6">
            <AnimatePresence>
              {authStep === "email" && (
                <motion.div key="email-fields">
                  <BlurFade delay={0.05} className="w-full">
                    <div className="glass-input-wrap w-full mb-4">
                      <div className="glass-input py-3">
                        <div className="relative z-10 flex-shrink-0 w-10 pl-2 flex items-center justify-center" />
                        <input
                          type="text"
                          placeholder="Full name"
                          autoComplete="name"
                          value={name}
                          onChange={(ev) => setName(ev.target.value)}
                          className="relative z-10 flex-grow min-w-0 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="glass-input-wrap w-full">
                      <div className="glass-input py-2">
                        <span className="glass-input-text-area" />
                        <div
                          className={cn(
                            "relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300",
                            email.length > 22 && authStep === "email"
                              ? "w-0 px-0"
                              : "w-10 pl-2"
                          )}
                        >
                          <Mail className="h-5 w-5 text-foreground/80 flex-shrink-0" />
                        </div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(ev) => setEmail(ev.target.value)}
                          onKeyDown={handleKeyDown}
                          className={cn(
                            "relative z-10 min-w-0 flex-grow bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
                            isEmailValid && authStep === "email" ? "pr-2" : "pr-0"
                          )}
                        />
                        <div
                          className={cn(
                            "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300",
                            isEmailValid && nameOk ? "w-12 pr-1" : "w-0"
                          )}
                        >
                          <GlassButton
                            type="button"
                            onClick={handleProgressStep}
                            size="icon"
                            aria-label="Continue with email"
                            contentClassName="text-foreground/80 hover:text-foreground"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  </BlurFade>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {authStep !== "confirmPassword" && authStep !== "email" ? (
                <motion.div key="pw-block" exit={{ opacity: 0 }}>
                  <BlurFade className="w-full space-y-4">
                    <div className="glass-input-wrap w-full">
                      <div className="glass-input py-2">
                        <span className="glass-input-text-area" />
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                          {isPasswordValid ? (
                            <button
                              type="button"
                              aria-label="Toggle visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-foreground/80 hover:text-foreground p-2 rounded-full"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          ) : (
                            <Lock className="h-5 w-5 text-foreground/80 flex-shrink-0" />
                          )}
                        </div>
                        <input
                          ref={passwordInputRef}
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(ev) => setPassword(ev.target.value)}
                          onKeyDown={handleKeyDown}
                          className="relative z-10 min-w-0 flex-grow bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <div
                          className={cn(
                            "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300",
                            isPasswordValid ? "w-12 pr-1" : "w-0"
                          )}
                        >
                          <GlassButton
                            type="button"
                            onClick={handleProgressStep}
                            size="icon"
                            aria-label="Next"
                            contentClassName="text-foreground/80"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Go back
                    </button>
                  </BlurFade>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {authStep === "confirmPassword" ? (
                <BlurFade key="confirm-block" className="w-full space-y-4">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-full border px-4 py-3 text-sm text-foreground"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "rgb(0 0 0 / 35%)",
                    }}
                  >
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value || "placeholder"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <div className="glass-input-wrap w-full">
                    <div className="glass-input py-2">
                      <span className="glass-input-text-area" />
                      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                        {isConfirmPasswordValid ? (
                          <button
                            type="button"
                            aria-label="Toggle confirm visibility"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="text-foreground/80 hover:text-foreground p-2 rounded-full"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        ) : (
                          <Lock className="h-5 w-5 text-foreground/80 flex-shrink-0" />
                        )}
                      </div>
                      <input
                        ref={confirmPasswordInputRef}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(ev) => setConfirmPassword(ev.target.value)}
                        className="relative z-10 min-w-0 flex-grow bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                      <div
                        className={cn(
                          "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300",
                          isConfirmPasswordValid && role ? "w-12 pr-1" : "w-0"
                        )}
                      >
                        <GlassButton
                          type="submit"
                          size="icon"
                          aria-label="Finish"
                          disabled={!(isConfirmPasswordValid && role)}
                          contentClassName="text-foreground/80"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Go back
                  </button>
                </BlurFade>
              ) : null}
            </AnimatePresence>
          </form>
        </fieldset>
      </div>
    </div>
  );
};

export default AuthComponent;
