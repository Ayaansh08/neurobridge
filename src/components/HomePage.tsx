import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import RehearsalTicket from './landing/RehearsalTicket';
import ClippingStrip from './landing/ClippingStrip';
import ReadinessGauge from './landing/ReadinessGauge';
import GlareButton from './landing/GlareButton';
import './HomePage.css';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const caseIndexRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Headline & Hero Staggered Line Entrance
    if (heroRef.current) {
      const eyebrow = heroRef.current.querySelector('.home-hero__eyebrow-wrap');
      const titleLines = heroRef.current.querySelectorAll('.home-hero__headline-line');
      const subtitle = heroRef.current.querySelector('.home-hero__subtitle');
      const actions = heroRef.current.querySelector('.home-hero__actions');
      const ticket = heroRef.current.querySelector('.home-hero__ticket-col');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(eyebrow, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1 })
        .fromTo(
          titleLines,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.12 },
          '-=0.3'
        )
        .fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
        .fromTo(actions, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.25')
        .fromTo(ticket, { opacity: 0, x: 28, y: 10 }, { opacity: 1, x: 0, y: 0, duration: 0.8 }, '-=0.5');
    }

    // Scroll reveal observer for editorial case items & quotes
    const revealEls = document.querySelectorAll('.editorial-reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(entry.target, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power3.out'
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-editorial">
      {/* ── Background Film Grain Overlay ── */}
      <div className="home-grain" aria-hidden="true" />

      {/* ── Header / Masthead ── */}
      <header className="home-masthead">
        <div className="home-masthead__inner">
          <div className="home-masthead__brand-group">
            <a className="home-masthead__brand" href="/">
              NeuroBridge
            </a>
            <span className="home-masthead__vol">VOL. IV · ISSUE 2</span>
          </div>

          <nav className="home-masthead__nav" aria-label="Main Navigation">
            <a
              className="home-masthead__link"
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              Sign In
            </a>
            <GlareButton
              variant="primary"
              className="home-masthead__btn"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </GlareButton>
          </nav>
        </div>
      </header>

      {/* ── Hero: 12-Column Asymmetric Grid ── */}
      <section className="home-hero" ref={heroRef}>
        <div className="home-hero__grid">
          {/* Columns 1–7: Editorial Text Anchor */}
          <div className="home-hero__text-col">
            <div className="home-hero__eyebrow-wrap">
              <span className="home-hero__eyebrow">AI-POWERED CONVERSATION PRACTICE</span>
              <div className="home-hero__eyebrow-rule" />
            </div>

            <h1 className="home-hero__headline">
              <span className="home-hero__headline-line">Rehearse the</span>
              <span className="home-hero__headline-line">conversations you</span>
              <span className="home-hero__headline-line">
                cannot afford to <em className="home-hero__emphasis">get wrong.</em>
              </span>
            </h1>

            <p className="home-hero__subtitle">
              NeuroBridge provides a calm, private space to practice emotionally loaded moments —
              executive interviews, high-stakes conflict, and boundary-setting — with an adaptive AI partner
              before the real encounter happens.
            </p>

            <div className="home-hero__actions">
              <GlareButton
                variant="primary"
                className="home-hero__cta-primary"
                onClick={() => navigate('/signup')}
              >
                Start Practicing &rarr;
              </GlareButton>
              <button
                className="home-hero__cta-ghost"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                Sign In to Archive
              </button>
            </div>

            <div className="home-hero__meta-strip">
              <span className="home-hero__meta-item">Private & Judgment-Free</span>
              <span className="home-hero__meta-divider">·</span>
              <span className="home-hero__meta-item">Adaptive Bedrock AI</span>
              <span className="home-hero__meta-divider">·</span>
              <span className="home-hero__meta-item">Multi-Dimension Coaching</span>
            </div>
          </div>

          {/* Columns 8–12: Rehearsal Ticket Breaking the Grid */}
          <div className="home-hero__ticket-col">
            <div className="home-hero__ticket-lead-tag">EXEMPLAR PROTOCOL</div>
            <RehearsalTicket />
          </div>
        </div>
      </section>

      {/* ── Clipping Strip: Horizontal Dialogue Texture Band ── */}
      <ClippingStrip />

      {/* ── Case Index: How It Works ── */}
      <section className="home-case-index" ref={caseIndexRef}>
        <div className="home-case-index__inner">
          <div className="home-case-index__header editorial-reveal">
            <div className="home-section-eyebrow">CASE INDEX · METHODOLOGY</div>
            <h2 className="home-case-index__title">Three movements of structured practice.</h2>
            <p className="home-case-index__lead">
              A disciplined, three-step methodology crafted for executives, team leads, and anyone navigating
              fraught relational dynamics.
            </p>
          </div>

          <div className="home-case-index__list">
            {/* Entry 01 */}
            <article className="home-case-entry editorial-reveal">
              <div className="home-case-entry__num">01</div>
              <div className="home-case-entry__content">
                <h3 className="home-case-entry__title">Select Your Scenario & Difficulty Tier</h3>
                <p className="home-case-entry__body">
                  Choose from behavioral job interviews, workplace friction, asking for compensation adjustments,
                  or holding boundaries under pressure. Calibrate the AI’s temperament from supportive to
                  unforgivingly direct.
                </p>
                <div className="home-case-entry__tag">PROTOCOL SELECTION · BEDROCK RUNTIME</div>
              </div>
            </article>

            {/* Entry 02 */}
            <article className="home-case-entry editorial-reveal">
              <div className="home-case-entry__num">02</div>
              <div className="home-case-entry__content">
                <h3 className="home-case-entry__title">Converse in Real Time via Voice or Text</h3>
                <p className="home-case-entry__body">
                  Engage in an adaptive back-and-forth dialogue. The AI partner listens, probes weak responses,
                  and mimics the psychological tension of the actual conversation without recording permanent personal baggage.
                </p>
                <div className="home-case-entry__tag">ZERO-JUDGMENT SIMULATION · REALISTIC PACING</div>
              </div>
            </article>

            {/* Entry 03 */}
            <article className="home-case-entry editorial-reveal">
              <div className="home-case-entry__num">03</div>
              <div className="home-case-entry__content">
                <h3 className="home-case-entry__title">Review Qualitative Coaching & Recalibrate</h3>
                <p className="home-case-entry__body">
                  Receive structured breakdown across four dimensions: Clarity, Tone, Responsiveness, and Composure.
                  Pinpoint exact sentences where defensiveness crept in, refine your phrasing, and run the take again.
                </p>
                <div className="home-case-entry__tag">STRUCTURED DEBRIEF · PROGRESS LOGBOOK</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── Full-Bleed Pull-Quote ── */}
      <section className="home-pullquote">
        <div className="home-pullquote__inner editorial-reveal">
          <div className="home-pullquote__rule-top" />
          <blockquote className="home-pullquote__quote">
            “The most demanding conversations in life rarely fail because of the facts.
            They fail because under emotional load, we lose our composure before finding our words.”
          </blockquote>
          <cite className="home-pullquote__citation">
            <span className="home-pullquote__author">NeuroBridge Practice Doctrine</span>
            <span className="home-pullquote__source">Department of Behavioral Preparation</span>
          </cite>
          <div className="home-pullquote__rule-bottom" />
        </div>
      </section>

      {/* ── Readiness Gauge Mini-Section ── */}
      <section className="home-gauge-section">
        <div className="home-gauge-section__inner editorial-reveal">
          <ReadinessGauge />
        </div>
      </section>

      {/* ── Closing Editorial CTA ── */}
      <section className="home-closing-cta">
        <div className="home-closing-cta__inner editorial-reveal">
          <div className="home-section-eyebrow">PRACTICE ARCHIVE · OPEN ACCESS</div>
          <h2 className="home-closing-cta__heading">
            Enter your next difficult conversation with quiet clarity.
          </h2>
          <p className="home-closing-cta__desc">
            No subscription paywall for initial practice sessions. No permanent data tracking.
            Just a focused environment designed to prepare your best self.
          </p>
          <div className="home-closing-cta__actions">
            <GlareButton
              variant="primary"
              className="home-closing-cta__btn"
              onClick={() => navigate('/signup')}
            >
              Begin Your First Rehearsal &rarr;
            </GlareButton>
          </div>
        </div>
      </section>

      {/* ── Colophon / Masthead Footer ── */}
      <footer className="home-editorial-footer">
        <div className="home-editorial-footer__inner">
          <div className="home-editorial-footer__top">
            <div className="home-editorial-footer__col-brand">
              <span className="home-editorial-footer__brand">NeuroBridge</span>
              <p className="home-editorial-footer__motto">
                A warm-noir simulation environment for high-stakes conversation rehearsal.
              </p>
            </div>

            <div className="home-editorial-footer__nav-cols">
              <div className="home-editorial-footer__col">
                <span className="home-editorial-footer__heading">SCENARIOS</span>
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Executive Interview</a>
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Workplace Conflict</a>
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Boundary Setting</a>
              </div>

              <div className="home-editorial-footer__col">
                <span className="home-editorial-footer__heading">EDITORIAL</span>
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Methodology</a>
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sensory Comfort</a>
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Privacy Policy</a>
              </div>
            </div>
          </div>

          <div className="home-editorial-footer__bottom">
            <span>© {new Date().getFullYear()} NeuroBridge. All rights reserved.</span>
            <span>Typeset in Fraunces & Public Sans · Printed in Code</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;