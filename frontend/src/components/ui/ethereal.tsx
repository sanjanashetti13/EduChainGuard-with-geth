import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  cinematicPostShader,
  fragmentShader,
  vertexShader,
} from "./ethereal-shaders";
import "./ethereal.css";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollSection {
  id: string;
  headline: string;
  subheadline: string;
  body: string;
}

export interface ColorPaletteProps {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  dark: string;
}

export interface ScrollHeroProps {
  sections?: ScrollSection[];
  colorPalette?: ColorPaletteProps;
  logo?: React.ReactNode;
  menuItems?: string[];
  /** Extra controls (e.g. React Router `Link`s) rendered in the top bar */
  navExtras?: React.ReactNode;
  /** When true the fixed top chrome (section links / extras) is omitted */
  hideNav?: boolean;
}

const defaultSections: ScrollSection[] = [
  {
    id: "hero",
    headline: "Ethereal",
    subheadline: "Beyond Reality",
    body: "Immersive experiences through computational artistry",
  },
  {
    id: "about",
    headline: "Innovation",
    subheadline: "Through Design",
    body: "Pushing boundaries of digital experiences",
  },
  {
    id: "services",
    headline: "Crafted",
    subheadline: "With Purpose",
    body: "Every pixel serves a greater vision",
  },
  {
    id: "contact",
    headline: "Connect",
    subheadline: "Create Together",
    body: "Let's build something extraordinary",
  },
];

const ScrollHero = ({
  sections = defaultSections,
  colorPalette = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    tertiary: "#ec4899",
    accent: "#06ffa5",
    dark: "#0a0a0a",
  },
  logo = "STUDIO",
  menuItems = ["Work", "About", "Services", "Contact"],
  navExtras,
  hideNav = false,
}: ScrollHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  const scrollRef = useRef({
    progress: 0,
    velocity: 0,
    rotation: { x: 0, y: 0 },
  });
  const mouseRef = useRef({ x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 });

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let frameId = 0;
    let running = true;
    const clock = new THREE.Clock();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.IcosahedronGeometry(1.85, 5);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uScrollProgress: { value: 0 },
        uScrollVelocity: { value: 0 },
        uSectionT: { value: 0 },
        uSectionIndex: { value: 0 },
        uColor1: { value: new THREE.Color(colorPalette.primary) },
        uColor2: { value: new THREE.Color(colorPalette.secondary) },
        uColor3: { value: new THREE.Color(colorPalette.tertiary) },
        uAccent: { value: new THREE.Color(colorPalette.accent) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.7,
      0.35,
      0.92
    );
    composer.addPass(bloom);

    const cinePass = new ShaderPass(cinematicPostShader);
    cinePass.uniforms.uResolution.value.set(
      window.innerWidth,
      window.innerHeight
    );
    composer.addPass(cinePass);

    setIsLoaded(true);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      const lastPass = composer.passes[
        composer.passes.length - 1
      ] as ShaderPass;
      const resU = lastPass.uniforms?.uResolution?.value as
        | THREE.Vector2
        | undefined;
      if (resU) resU.set(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
      if (!running) return;
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const m = meshRef.current;
      if (m?.material instanceof THREE.ShaderMaterial) {
        m.material.uniforms.uTime.value = t;
        mouseRef.current.sx +=
          (mouseRef.current.x - mouseRef.current.sx) * 0.1;
        mouseRef.current.sy +=
          (mouseRef.current.y - mouseRef.current.sy) * 0.1;
        m.material.uniforms.uMouse.value.set(
          mouseRef.current.sx,
          mouseRef.current.sy
        );
        m.material.uniforms.uScrollProgress.value = scrollRef.current.progress;
        m.material.uniforms.uScrollVelocity.value =
          scrollRef.current.velocity;
        m.rotation.x = scrollRef.current.rotation.x;
        m.rotation.y = scrollRef.current.rotation.y;
        if (Math.abs(scrollRef.current.velocity) < 0.01) {
          m.position.y = Math.sin(t * 0.45) * 0.06;
        } else {
          m.position.y *= 0.9;
        }
      }
      const lastPass = composer.passes[
        composer.passes.length - 1
      ] as ShaderPass;
      if (lastPass.uniforms?.uTime) {
        (lastPass.uniforms.uTime as { value: number }).value = t;
      }
      composer.render();
    };
    animate();

    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      composer.dispose();
      renderer.dispose();
      meshRef.current = null;
    };
  }, [
    colorPalette.primary,
    colorPalette.secondary,
    colorPalette.tertiary,
    colorPalette.accent,
    colorPalette.dark,
  ]);

  useEffect(() => {
    if (!isLoaded) return undefined;

    let lastY = window.scrollY;
    let vel = 0;
    let velTimeout: ReturnType<typeof setTimeout>;

    ScrollTrigger.create({
      trigger: containerRef.current ?? undefined,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollRef.current.progress = self.progress;
        const y = window.scrollY;
        vel = (y - lastY) * 0.01;
        lastY = y;
        scrollRef.current.velocity = THREE.MathUtils.clamp(vel, -1, 1);
        gsap.to(scrollRef.current.rotation, {
          x: self.progress * Math.PI * 3.0,
          y: self.progress * Math.PI * 4.5,
          duration: 0.3,
          ease: "power2.out",
        });
        clearTimeout(velTimeout);
        velTimeout = setTimeout(() => {
          gsap.to(scrollRef.current, {
            velocity: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        }, 120);
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            scaleY: self.progress,
            duration: 0.12,
          });
        }
      },
    });

    sections.forEach((section, idx) => {
      const el = sectionsRef.current[idx];
      if (!el) return;

      gsap.fromTo(
        el.querySelectorAll(
          ".section-headline, .section-subheadline, .section-body"
        ),
        { opacity: 0, y: 80, rotationX: -10 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          stagger: 0.15,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        }
      );

      ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => {
          setActiveSection(idx);
          const m = meshRef.current;
          if (m?.material instanceof THREE.ShaderMaterial) {
            gsap.to(m.material.uniforms.uSectionIndex, {
              value: idx,
              duration: 1.2,
              ease: "power2.inOut",
            });
            gsap.fromTo(
              m.material.uniforms.uSectionT,
              { value: 0 },
              {
                value: 1,
                duration: 0.5,
                ease: "power2.in",
                yoyo: true,
                repeat: 1,
              }
            );
          }
        },
        onEnterBack: () => {
          setActiveSection(idx);
          const m = meshRef.current;
          if (m?.material instanceof THREE.ShaderMaterial) {
            gsap.to(m.material.uniforms.uSectionIndex, {
              value: idx,
              duration: 1.2,
              ease: "power2.inOut",
            });
          }
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isLoaded, sections]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={containerRef} className="scroll-hero">
      <canvas ref={canvasRef} className="hero-canvas" />

      <div className="scroll-progress">
        <div ref={progressRef} className="scroll-progress-bar" />
      </div>

      {!hideNav && (
        <nav className="nav-container">
          <div className="nav-inner">
            <div className="nav-logo">{logo}</div>
            <div className="nav-menu">
              {menuItems.map((item, i) => (
                <a
                  key={item}
                  href={`#${sections[i]?.id ?? item.toLowerCase()}`}
                  className={`nav-item ${activeSection === i ? "active" : ""}`}
                >
                  {item}
                </a>
              ))}
              {navExtras ? <div className="nav-extras">{navExtras}</div> : null}
            </div>
          </div>
        </nav>
      )}

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          ref={(el) => {
            sectionsRef.current[index] = el;
          }}
          className="hero-section"
          data-section={index}
        >
          <div className="section-content">
            <h1 className="section-headline">{section.headline}</h1>
            <h2 className="section-subheadline">{section.subheadline}</h2>
            <p className="section-body">{section.body}</p>
          </div>
        </section>
      ))}

      <div className={`loading-overlay ${isLoaded ? "loaded" : ""}`}>
        <div className="loading-text">Loading</div>
      </div>
    </div>
  );
};

export default ScrollHero;
/** Alias aligned with cinematic hero naming used in integrations */
export { ScrollHero as CinematicHeroSection };
