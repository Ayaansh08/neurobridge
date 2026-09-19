import { useEffect, useRef, type CSSProperties, type ReactNode, type MouseEventHandler } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';
import gsap from 'gsap';
import Aurora from './Aurora';
import './HomePage.css';
import './SpecularButton.css';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/* ─── SpecularButton Component ────────────────────────── */

type ButtonSize = 'sm' | 'md' | 'lg';

export interface SpecularButtonProps {
  children?: ReactNode;
  size?: ButtonSize;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

interface ShaderProps {
  radius: number;
  lineColor: string;
  baseColor: string;
  intensity: number;
  shineSize: number;
  shineFade: number;
  thickness: number;
  speed: number;
  followMouse: boolean;
  proximity: number;
  autoAnimate: boolean;
}

const PAD = 20;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Dark base stroke hugging the edge for a sense of thickness
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  // Symmetric specular: the edges facing toward/away from the light both
  // catch a streak. The angular window (size + fade) is measured with an
  // elliptical normal so it varies continuously along straight edges.
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

export const SpecularButton = ({
  children = 'Get Started',
  size = 'lg',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button'
}: SpecularButtonProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const propsRef = useRef<ShaderProps>({ radius, lineColor, baseColor, intensity, shineSize, shineFade, thickness, speed, followMouse, proximity, autoAnimate });

  useEffect(() => {
    propsRef.current = { radius, lineColor, baseColor, intensity, shineSize, shineFade, thickness, speed, followMouse, proximity, autoAnimate };
  }, [radius, lineColor, baseColor, intensity, shineSize, shineFade, thickness, speed, followMouse, proximity, autoAnimate]);

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx) return;

    const dpr = window.devicePixelRatio || 1;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [0.32, 0.32, 0.32] },
        uIntensity: { value: 1 },
        uShineSize: { value: 0.17 },
        uShineFade: { value: 0.7 },
        uThickness: { value: 1 },
        uBaseWidth: { value: dpr }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    fx.appendChild(gl.canvas);

    const sizeRef = { w: 1, h: 1 };
    const resize = () => {
      const rect = btn.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      sizeRef.w = w;
      sizeRef.h = h;
      renderer.setSize(w + PAD * 2, h + PAD * 2);
      program.uniforms.uCenter.value = [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr];
      program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(btn);
    resize();

    let pointerAngle: number | null = null;
    let proximityT = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        const nx = (e.clientX - cx) / (rect.width / 2);
        const ny = (cy - e.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }
      const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
      proximityT = t * t * (3 - 2 * t);
    };
    window.addEventListener('pointermove', onPointerMove);

    let angle = 2.4;
    let idleAngle = 2.4;
    let bright = 0;
    let last = performance.now();
    let raf = 0;

    const lineC = new Color();
    const baseC = new Color();

    const update = (now: number) => {
      raf = requestAnimationFrame(update);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = propsRef.current;

      idleAngle += p.speed * dt;
      const target =
        p.followMouse && pointerAngle != null && (!p.autoAnimate || proximityT > 0) ? pointerAngle : idleAngle;
      const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += diff * (1 - Math.exp(-dt * 7));

      const brightTarget = p.autoAnimate ? 1 : proximityT;
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

      lineC.set(p.lineColor);
      baseC.set(p.baseColor);
      program.uniforms.uAngle.value = angle;
      program.uniforms.uRadius.value = Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
      program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
      program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
      program.uniforms.uIntensity.value = p.intensity * bright;
      program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
      program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
      program.uniforms.uThickness.value = p.thickness * dpr;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`specular-button specular-button--${size}${className ? ` ${className}` : ''}`}
      style={
        {
          '--sb-radius': `${radius}px`,
          '--sb-tint': tint,
          '--sb-tint-opacity': tintOpacity,
          '--sb-blur': `${blur}px`,
          '--sb-text-color': textColor
        } as CSSProperties
      }
    >
      <span ref={fxRef} className="specular-button__fx" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </button>
  );
};

/* ─── Inline SVG Icons ────────────────────────────────── */

const IconShield = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 2L3 7v5c0 5.25 3.81 10.15 9 11.25C17.19 22.15 21 17.25 21 12V7l-9-5z" />
  </svg>
);

const IconCpu = () => (
  <svg viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" />
  </svg>
);

const IconTrendingUp = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconBriefcase = () => (
  <svg viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconHeart = () => (
  <svg viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/* ─── HomePage Component ──────────────────────────────── */

export const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      const els = heroRef.current.querySelectorAll(
        '.home-hero__badge, .home-hero__title, .home-hero__subtitle, .home-hero__actions',
      );
      gsap.fromTo(
        els,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.15 },
      );
    }

    const revealEls = document.querySelectorAll('.home-reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );

    for (const el of revealEls) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      {/* ── Navbar ── */}
      <nav className="home-nav">
        <a className="home-nav__brand" href="/">NeuroBridge</a>
        <div className="home-nav__links">
          <a className="home-nav__link home-nav__link--ghost" href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            Sign in
          </a>
          <SpecularButton
            size="sm"
            tint="#3b82f6"
            tintOpacity={0.2}
            blur={8}
            lineColor="#60a5fa"
            baseColor="#1e3a8a"
            radius={20}
            onClick={() => navigate('/signup')}
          >
            Get Started
          </SpecularButton>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero" ref={heroRef}>
        <Aurora
          colorStops={['#1D4ED8', '#38BDF8', '#93C5FD']}
          amplitude={0.85}
          blend={0.42}
          speed={0.55}
        />
        <div className="home-hero__content">
          <span className="home-hero__badge" style={{ opacity: 0 }}>
            <span className="home-hero__badge-dot" />
            AI-Powered Conversation Practice
          </span>

          <h1 className="home-hero__title" style={{ opacity: 0 }}>
            Practice difficult moments{' '}
            <span className="home-hero__title-accent">before they happen</span>
          </h1>

          <p className="home-hero__subtitle" style={{ opacity: 0 }}>
            NeuroBridge gives you a private, AI-powered space to rehearse tough
            conversations — interviews, conflicts, boundaries — so the first
            attempt doesn't have to be the real one.
          </p>

          <div className="home-hero__actions" style={{ opacity: 0 }}>
            <SpecularButton
              size="lg"
              tint="#2563eb"
              tintOpacity={0.25}
              blur={12}
              lineColor="#93c5fd"
              baseColor="#1d4ed8"
              radius={24}
              onClick={() => navigate('/signup')}
            >
              Start Practicing →
            </SpecularButton>
            <a className="home-hero__cta home-hero__cta--outline" href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home-section home-section--bordered">
        <div className="home-section__inner">
          <span className="home-section__label home-reveal">Features</span>
          <h2 className="home-section__heading home-reveal">
            Everything you need to prepare with confidence
          </h2>
          <p className="home-section__desc home-reveal">
            A safe, structured environment to rehearse conversations that matter —
            powered by AI, designed around how people actually learn.
          </p>

          <div className="home-features">
            <article className="home-feature-card home-reveal">
              <div className="home-feature-card__icon"><IconShield /></div>
              <h3 className="home-feature-card__title">Safe Practice Space</h3>
              <p className="home-feature-card__body">
                Rehearse conversations privately — no pressure, no judgment.
                Build confidence before the real moment arrives.
              </p>
            </article>

            <article className="home-feature-card home-reveal">
              <div className="home-feature-card__icon"><IconCpu /></div>
              <h3 className="home-feature-card__title">AI-Powered Roleplay</h3>
              <p className="home-feature-card__body">
                Engage with adaptive AI partners that simulate realistic
                scenarios — interviews, conflicts, boundary-setting, and more.
              </p>
            </article>

            <article className="home-feature-card home-reveal">
              <div className="home-feature-card__icon"><IconTrendingUp /></div>
              <h3 className="home-feature-card__title">Track Your Progress</h3>
              <p className="home-feature-card__body">
                Get structured feedback after each session. Retry, improve, and
                watch your confidence grow over time with insights and XP.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="home-section home-section--alt">
        <div className="home-section__inner">
          <span className="home-section__label home-reveal">How It Works</span>
          <h2 className="home-section__heading home-reveal">
            Three steps to feeling ready
          </h2>
          <p className="home-section__desc home-reveal">
            No setup, no scheduling, no awkwardness. Just pick a scenario and start practicing.
          </p>

          <div className="home-steps">
            <div className="home-step home-reveal">
              <span className="home-step__number">01</span>
              <h3 className="home-step__title">Choose a scenario</h3>
              <p className="home-step__body">
                Pick from interviews, workplace conflicts, setting boundaries, asking
                for a raise, or describe your own situation.
              </p>
            </div>
            <div className="home-step home-reveal">
              <span className="home-step__number">02</span>
              <h3 className="home-step__title">Practice with AI</h3>
              <p className="home-step__body">
                Step into a realistic conversation with an AI partner that adapts to
                your responses — just like the real thing, but safe to fail.
              </p>
            </div>
            <div className="home-step home-reveal">
              <span className="home-step__number">03</span>
              <h3 className="home-step__title">Get feedback & retry</h3>
              <p className="home-step__body">
                Review what went well, where you can improve, and try again. Each
                attempt strengthens your readiness and builds lasting confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="home-section home-section--bordered">
        <div className="home-section__inner">
          <span className="home-section__label home-reveal">Who It's For</span>
          <h2 className="home-section__heading home-reveal">
            Practice what matters most to you
          </h2>
          <p className="home-section__desc home-reveal">
            Whether you're preparing for a career milestone or a personal conversation,
            NeuroBridge helps you show up ready.
          </p>

          <div className="home-cases">
            <article className="home-case home-reveal">
              <div className="home-case__icon"><IconBriefcase /></div>
              <h3 className="home-case__title">Job Interviews</h3>
              <p className="home-case__body">
                Practice behavioral questions, salary negotiations, and high-pressure
                interview scenarios until they feel natural.
              </p>
            </article>

            <article className="home-case home-reveal">
              <div className="home-case__icon"><IconUsers /></div>
              <h3 className="home-case__title">Workplace Conflicts</h3>
              <p className="home-case__body">
                Prepare for tough conversations with managers, teammates, or reports —
                learn to stay calm and communicate clearly.
              </p>
            </article>

            <article className="home-case home-reveal">
              <div className="home-case__icon"><IconHeart /></div>
              <h3 className="home-case__title">Setting Boundaries</h3>
              <p className="home-case__body">
                Rehearse saying no, pushing back, or asking for what you need — in
                relationships, at work, or in everyday life.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="home-cta home-section--alt">
        <div className="home-cta__inner home-reveal">
          <h2 className="home-cta__heading">
            Ready to practice your next difficult moment?
          </h2>
          <p className="home-cta__desc">
            Create a free account and start rehearsing in minutes.
            No credit card, no commitment — just a safer way to prepare.
          </p>
          <SpecularButton
            size="lg"
            tint="#3b82f6"
            tintOpacity={0.3}
            blur={10}
            lineColor="#93c5fd"
            baseColor="#1d4ed8"
            radius={24}
            onClick={() => navigate('/signup')}
          >
            Get Started Free →
          </SpecularButton>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <span className="home-footer__brand">NeuroBridge</span> · Practice difficult
        moments before they happen. © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default HomePage;