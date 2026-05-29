import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
import * as THREE from "three";

import { cn } from "../../lib/utils";
import { dashboardPathForRole } from "../../utils/routeForRole";

function apiUrl() {
  return process.env.REACT_APP_API_URL ?? "http://localhost:5000";
}

/** Normalized uniforms for THREE.ShaderMaterial */
type PreparedUniformMap = Record<string, THREE.IUniform>;

type UniformDescriptor = {
  value: number | number[] | number[][];
  type: string;
};

type UniformDescriptors = Record<string, UniformDescriptor>;

interface ShaderInnerProps {
  fragmentShader: string;
  uniforms: UniformDescriptors;
}

const FULLSCREEN_VERTEX = /* glsl */ `
out vec2 fragCoord;
uniform vec2 u_resolution;
void main() {
  vec2 pos = vec2(position.x, position.y);
  gl_Position = vec4(pos, 0.0, 1.0);
  fragCoord = (pos + 1.0) * 0.5 * u_resolution;
  fragCoord.y = u_resolution.y - fragCoord.y;
}
`;

function prepareThreeUniforms(
  descriptors: UniformDescriptors
): PreparedUniformMap {
  const prepared: PreparedUniformMap = {};
  for (const [name, u] of Object.entries(descriptors)) {
    switch (u.type) {
      case "uniform1f":
        prepared[name] = { value: u.value as number };
        break;
      case "uniform1i":
        prepared[name] = { value: u.value as number };
        break;
      case "uniform1fv":
        prepared[name] = { value: (u.value as number[]).slice() };
        break;
      case "uniform3fv": {
        const arr = u.value as number[][];
        prepared[name] = {
          value: arr.map((c) =>
            new THREE.Vector3(c[0] / 255, c[1] / 255, c[2] / 255)
          ),
        };
        break;
      }
      default:
        break;
    }
  }
  return prepared;
}

function ShaderMesh({ fragmentShader, uniforms }: ShaderInnerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const material = useMemo(() => {
    const uni = prepareThreeUniforms(uniforms);
    uni.u_time = { value: 0 };
    uni.u_resolution = {
      value: new THREE.Vector2(
        Math.max(size.width, 1) * 2,
        Math.max(size.height, 1) * 2
      ),
    };
    return new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader,
      uniforms: uni,
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [fragmentShader, uniforms, size.height, size.width]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const mat = mesh.material as THREE.ShaderMaterial;
    const w = Math.max(size.width, 1) * 2;
    const h = Math.max(size.height, 1) * 2;
    mat.uniforms.u_time.value = clock.getElapsedTime();
    mat.uniforms.u_resolution.value.set(w, h);
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function ShaderCanvas({ fragmentShader, uniforms }: ShaderInnerProps) {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      orthographic
      camera={{
        zoom: 1,
        position: [0, 0, 5],
        near: 0.01,
        far: 500,
      }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      }}
      style={{ pointerEvents: "none" }}
    >
      <ShaderMesh fragmentShader={fragmentShader} uniforms={uniforms} />
    </Canvas>
  );
}

interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
  center?: ("x" | "y")[];
  animationFactor?: number;
}

const DOT_FRAGMENT = ({
  center,
}: {
  center: ("x" | "y")[];
}) => /* glsl */ `
precision highp float;
in vec2 fragCoord;

uniform float u_time;
uniform float u_opacities[10];
uniform vec3 u_colors[6];
uniform float u_total_size;
uniform float u_dot_size;
uniform vec2 u_resolution;
uniform int u_reverse;
uniform float u_anim_speed;

out vec4 fragColor;

float PHI = 1.61803398874989484820459;
float random(vec2 xy) {
  return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
}

void main() {
  vec2 st = fragCoord.xy;
  ${center.includes("x")
      ? `st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));`
      : ""
    }
  ${center.includes("y")
      ? `st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));`
      : ""
    }

  float opacity = step(0.0, st.x);
  opacity *= step(0.0, st.y);

  vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

  float frequency = 5.0;
  float show_offset = random(st2);
  float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
  opacity *= u_opacities[int(rand * 10.0)];
  opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
  opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

  vec3 color = u_colors[int(show_offset * 6.0)];

  float animation_speed_factor = max(u_anim_speed, 0.01);
  vec2 center_grid = u_resolution / 2.0 / u_total_size;
  float dist_from_center = distance(center_grid, st2);

  float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
  float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
  float timing_offset_outro =
    (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + vec2(42.0, 42.0)) * 0.2);

  float current_timing_offset;
  if (u_reverse == 1) {
    current_timing_offset = timing_offset_outro;
    opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
    opacity *= clamp(
      (step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25,
      1.0,
      1.25
    );
  } else {
    current_timing_offset = timing_offset_intro;
    opacity *= step(current_timing_offset, u_time * animation_speed_factor);
    opacity *= clamp(
      (1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25,
      1.0,
      1.25
    );
  }

  fragColor = vec4(color, opacity);
  fragColor.rgb *= fragColor.a;
}
`;

const DotMatrix: React.FC<DotMatrixProps> = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = "",
  center = ["x", "y"],
  animationFactor = 0.35,
}) => {
  const uniforms = React.useMemo(() => {
    let colorsArray = [
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
    ];
    if (colors.length === 2) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[1],
      ];
    } else if (colors.length === 3) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[2],
        colors[2],
      ];
    }
    return {
      u_colors: {
        value: colorsArray,
        type: "uniform3fv",
      },
      u_opacities: {
        value: opacities,
        type: "uniform1fv",
      },
      u_total_size: {
        value: totalSize,
        type: "uniform1f",
      },
      u_dot_size: {
        value: dotSize,
        type: "uniform1f",
      },
      u_reverse: {
        value: shader.includes("u_reverse_active") ? 1 : 0,
        type: "uniform1i",
      },
      u_anim_speed: {
        value: animationFactor,
        type: "uniform1f",
      },
    } satisfies UniformDescriptors;
  }, [colors, opacities, totalSize, dotSize, shader, animationFactor]);

  const fragmentShader = useMemo(() => DOT_FRAGMENT({ center }), [center]);

  return (
    <ShaderCanvas fragmentShader={fragmentShader} uniforms={uniforms} />
  );
};

export const CanvasRevealEffect = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) => {
  const shaderHint = `${
    reverse ? "u_reverse_active" : "false"
  }_;animation_${animationSpeed.toFixed(1)}_;`;
  const animFactor = 0.05 + animationSpeed / 25;

  return (
    <div className={cn("relative min-h-screen w-full bg-black", containerClassName)}>
      <div className="relative min-h-screen w-full">
        <DotMatrix
          colors={colors ?? [[0, 255, 255]]}
          dotSize={dotSize ?? 3}
          opacities={
            opacities ??
            [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]
          }
          shader={shaderHint}
          center={["x", "y"]}
          animationFactor={animFactor}
        />
      </div>
      {showGradient ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      ) : null}
    </div>
  );
};

const AnimatedNavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const defaultTextColor = "text-gray-300";
  const hoverTextColor = "text-white";
  const textSizeClass = "text-sm";

  return (
    <a
      href={href}
      className={`group relative flex h-5 items-center overflow-hidden ${textSizeClass} inline-block`}
    >
      <div className="flex transform flex-col transition-transform duration-400 ease-out group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </a>
  );
};

interface MiniNavbarProps {
  onSignupClick: () => void;
}

function MiniNavbar({ onSignupClick }: MiniNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full");
  const shapeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass("rounded-xl");
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full");
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 transform rounded-full bg-gray-200 opacity-80" />
      <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-gray-200 opacity-80" />
      <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-gray-200 opacity-80" />
      <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 transform rounded-full bg-gray-200 opacity-80" />
    </div>
  );

  const navLinksData = [
    { label: "Home", href: "/landing" },
    { label: "Sign in hub", href: "#auth" },
  ];

  const loginButtonElement = (
    <span className="w-full rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] px-4 py-2 text-center text-xs text-gray-300 transition-colors duration-200 hover:border-white/50 hover:text-white sm:w-auto sm:px-3 sm:text-sm">
      {"You're here"}
    </span>
  );

  const signupButtonElement = (
    <div className="group relative w-full sm:w-auto">
      <div
        className="pointer-events-none absolute inset-0 -m-2 hidden rounded-full bg-gray-100 opacity-40 blur-lg filter transition-all duration-300 ease-out group-hover:-m-3 group-hover:opacity-60 group-hover:blur-xl sm:block"
      />
      <button
        type="button"
        onClick={onSignupClick}
        className="relative z-10 w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:from-gray-200 hover:to-gray-400 sm:w-auto sm:px-3 sm:text-sm"
      >
        Signup
      </button>
    </div>
  );

  return (
    <header
      className={`fixed left-1/2 top-5 z-40 mx-auto flex w-[min(100%-1.75rem,40rem)] -translate-x-1/2 transform flex-col items-center border border-[#333] bg-[#1f1f1fca] py-2.5 pl-4 pr-4 shadow-lg shadow-black/40 backdrop-blur-md transition-[border-radius] duration-0 ease-in-out sm:w-auto sm:py-3 sm:pl-6 sm:pr-6 ${headerShapeClass}`}
    >
      <div className="flex w-full items-center justify-between gap-x-6 sm:gap-x-8">
        <div className="flex items-center">{logoElement}</div>

        <nav className="hidden items-center space-x-4 text-sm sm:flex sm:space-x-6">
          {navLinksData.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href + link.label}
                to={link.href}
                className="inline-block text-sm text-gray-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ) : (
              <AnimatedNavLink key={link.href} href={link.href}>
                {link.label}
              </AnimatedNavLink>
            )
          )}
        </nav>

        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          {loginButtonElement}
          {signupButtonElement}
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-gray-300 focus:outline-none sm:hidden"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`flex w-full flex-col items-center overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
          isOpen
            ? "max-h-[1000px] pt-4 opacity-100"
            : "pointer-events-none max-h-0 pt-0 opacity-0"
        }`}
      >
        <nav className="flex w-full flex-col items-center space-y-4 text-base">
          {navLinksData.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href + link.label + "m"}
                to={link.href}
                className="w-full text-center text-gray-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="w-full text-center text-gray-300 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            )
          )}
        </nav>
        <div className="mt-4 flex w-full flex-col items-center space-y-4">
          <div className="w-full text-center">{loginButtonElement}</div>
          {signupButtonElement}
        </div>
      </div>
    </header>
  );
}

interface SignInPageProps {
  className?: string;
  onRegisterClick: () => void;
}

export function SignInPage({ className, onRegisterClick }: SignInPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [step, setStep] = useState<"email" | "password" | "success">("email");
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const [loggedUser, setLoggedUser] = useState<{
    role: string;
  } | null>(null);

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
      setReverseCanvasVisible(true);
      setTimeout(() => setInitialCanvasVisible(false), 50);
      setLoggedUser({ role: data.user.role });
      setStep("success");
    } catch {
      setErr("Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setErr("");
      setStep("password");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/manual-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          typeof data?.error === "string" ? data.error : "Unable to sign in"
        );
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      setReverseCanvasVisible(true);
      setTimeout(() => setInitialCanvasVisible(false), 50);
      setLoggedUser({ role: data.user.role });
      setStep("success");
    } catch {
      setErr("Network error · is Flask running?");
    } finally {
      setBusy(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setPassword("");
    setErr("");
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  };

  const goDashboard = () => {
    if (!loggedUser) return;
    navigate(dashboardPathForRole(loggedUser.role), { replace: true });
  };

  return (
    <div
      id="auth"
      className={cn(
        "relative flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden bg-black",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0 min-h-screen">
        {initialCanvasVisible ? (
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <CanvasRevealEffect
                animationSpeed={3}
                containerClassName="bg-black"
                colors={[
                  [255, 255, 255],
                  [200, 200, 200],
                ]}
                dotSize={6}
                reverse={false}
              />
            </Suspense>
          </div>
        ) : null}

        {reverseCanvasVisible ? (
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <CanvasRevealEffect
                animationSpeed={4}
                containerClassName="bg-black"
                colors={[
                  [255, 255, 255],
                  [220, 220, 220],
                ]}
                dotSize={6}
                reverse
              />
            </Suspense>
          </div>
        ) : null}

        {/* Vignette: keep dots visible in the center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_45%,transparent_35%,rgba(0,0,0,0.45)_72%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute left-0 right-0 top-0 h-2/5 bg-gradient-to-b from-black/85 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <MiniNavbar onSignupClick={onRegisterClick} />

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col items-center px-4 pb-12 pt-[6.75rem] sm:px-6 sm:pt-[7.25rem]">
            <div className="mx-auto w-full max-w-md min-w-0">
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex w-full min-w-0 flex-col items-stretch space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[2.5rem]">
                        Welcome back
                      </h1>
                      <p className="font-light text-white/70 sm:text-[1.15rem]">
                        Sign in with Google or your institute email.
                      </p>
                    </div>

                    {err ? (
                      <p className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
                        {err}
                      </p>
                    ) : null}

                    <div className="flex w-full min-w-0 flex-col space-y-4">
                      <div className="relative isolate w-full max-w-full min-w-0 overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur-[2px]">
                        <div className="pointer-events-none flex min-h-[48px] w-full flex-col items-center justify-center gap-2 px-3 py-2.5 text-sm text-white sm:flex-row sm:text-base">
                          <span className="text-lg font-semibold leading-none">
                            G
                          </span>
                          <span className="leading-tight">
                            Sign in with Google
                          </span>
                        </div>
                        <div className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center opacity-0 [&>div]:!flex [&>div]:!h-full [&>div]:!w-full [&>div]:!items-center [&>div]:justify-center [&>div>*]:max-w-full">
                          <GoogleLogin
                            onSuccess={googleSuccess}
                            onError={() => setErr("Google error")}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-sm text-white/40">or</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>

                      <form className="w-full min-w-0" onSubmit={handleEmailSubmit}>
                        <div className="relative w-full">
                          <input
                            type="email"
                            placeholder="you@institute.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="box-border w-full min-w-0 max-w-full rounded-full border border-white/15 bg-white/[0.07] py-3 pl-4 pr-14 text-center text-sm text-white shadow-inner shadow-black/20 backdrop-blur-sm placeholder:text-white/45 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15 sm:text-base"
                            required
                            autoComplete="email"
                          />
                          <button
                            type="submit"
                            disabled={busy}
                            aria-label="Continue with email"
                            className="absolute right-1.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-base font-semibold text-black shadow-md shadow-black/30 transition-colors hover:bg-white/90 disabled:opacity-45"
                          >
                            →
                          </button>
                        </div>
                      </form>
                    </div>

                    <p className="text-xs text-white/40">
                      New to EduChainGuard?{" "}
                      <button
                        type="button"
                        onClick={onRegisterClick}
                        className="font-medium text-white/60 underline-offset-2 hover:text-white hover:underline"
                      >
                        Create account
                      </button>
                    </p>

                    <p className="pt-4 text-[10px] leading-relaxed text-white/30 sm:text-xs">
                      By continuing you agree to our{" "}
                      <Link
                        to="/landing"
                        className="underline decoration-white/20 hover:text-white/50"
                      >
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/landing"
                        className="underline decoration-white/20 hover:text-white/50"
                      >
                        Privacy
                      </Link>
                      .
                    </p>
                  </motion.div>
                ) : step === "password" ? (
                  <motion.div
                    key="password-step"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex w-full min-w-0 flex-col items-stretch space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[2.5rem]">
                        Enter password
                      </h1>
                      <p className="text-sm text-white/50">
                        {email ? (
                          <>
                            for <span className="text-white/80">{email}</span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    {err ? (
                      <p className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
                        {err}
                      </p>
                    ) : null}

                    <form className="w-full min-w-0 space-y-4" onSubmit={handlePasswordSubmit}>
                      <div className="relative w-full min-w-0">
                        <input
                          type={showPw ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="box-border w-full min-w-0 max-w-full rounded-full border border-white/15 bg-white/[0.07] py-3 pl-4 pr-12 text-center text-sm text-white shadow-inner shadow-black/20 backdrop-blur-sm placeholder:text-white/45 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15 sm:text-base"
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                          aria-label={showPw ? "Hide password" : "Show password"}
                        >
                          {showPw ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <div className="flex w-full gap-3">
                        <motion.button
                          type="button"
                          onClick={handleBackToEmail}
                          className="w-[32%] rounded-full bg-white px-4 py-3 font-medium text-black transition-colors hover:bg-white/90"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          Back
                        </motion.button>
                        <motion.button
                          type="submit"
                          disabled={busy || !password}
                          className={`flex-1 rounded-full border py-3 font-medium transition-all duration-300 ${
                            password && !busy
                              ? "cursor-pointer border-transparent bg-white text-black hover:bg-white/90"
                              : "cursor-not-allowed border-white/10 bg-[#111] text-white/50"
                          }`}
                          whileHover={
                            password && !busy ? { scale: 1.02 } : undefined
                          }
                          whileTap={
                            password && !busy ? { scale: 0.98 } : undefined
                          }
                        >
                          {busy ? "Signing in…" : "Sign in"}
                        </motion.button>
                      </div>
                    </form>

                    <p className="text-xs text-white/40">
                      <button
                        type="button"
                        onClick={onRegisterClick}
                        className="font-medium text-white/60 underline-offset-2 hover:text-white hover:underline"
                      >
                        Need an account?
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-step"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                    className="flex w-full min-w-0 flex-col items-stretch space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[2.5rem]">
                        You&apos;re in!
                      </h1>
                      <p className="text-[1.1rem] font-light text-white/50">
                        Welcome to EduChainGuard
                      </p>
                    </div>

                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="py-6"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-white to-white/70">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-black"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </motion.div>

                    <motion.button
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={goDashboard}
                      className="w-full rounded-full bg-white py-3 font-medium text-black transition-colors hover:bg-white/90"
                    >
                      Continue to dashboard
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
