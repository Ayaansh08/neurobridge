import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Aurora from './Aurora';
import './HomePage.css';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/* ─── Inline SVG Icons (replacing emojis) ────────────── */

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

/* ─── Component ──────────────────────────────────────── */

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
          <a className="home-nav__link home-nav__link--primary" href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
            Get Started
          </a>
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
            <a className="home-hero__cta home-hero__cta--primary" href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
              Start Practicing →
            </a>
            <a className="home-hero__cta home-hero__cta--outline" href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home-section home-section--bordered" >
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
          <a className="home-cta__button" href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
            Get Started Free →
          </a>
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
