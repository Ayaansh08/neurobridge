import React, { useState, useEffect } from 'react';
import './RehearsalTicket.css';

export const LoginRehearsalTicket: React.FC = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const targetText = '“Pick up where you left off. Your session history and coaching notes are ready.”';

  useEffect(() => {
    let index = 0;
    let timer: ReturnType<typeof setTimeout>;

    const typeNextChar = () => {
      if (index < targetText.length) {
        setDisplayedText(targetText.slice(0, index + 1));
        index++;
        const speed = Math.random() * 20 + 20;
        timer = setTimeout(typeNextChar, speed);
      } else {
        setIsTypingComplete(true);
      }
    };

    const startDelay = setTimeout(() => {
      setDisplayedText('');
      setIsTypingComplete(false);
      typeNextChar();
    }, 320);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="rehearsal-ticket-wrapper auth-ticket-wrapper">
      <div className="rehearsal-ticket">
        {/* Perforated torn header edge */}
        <div className="rehearsal-ticket__tear-top" aria-hidden="true" />

        <div className="rehearsal-ticket__inner">
          {/* Card Meta Bar */}
          <div className="rehearsal-ticket__meta">
            <div className="rehearsal-ticket__folio">
              <span className="rehearsal-ticket__stamp">FOLIO № 842-R</span>
              <span className="rehearsal-ticket__dept">RETURNING SESSION</span>
            </div>
            <div className="rehearsal-ticket__state-pill">SAVED PROGRESS</div>
          </div>

          {/* Scenario Tab Display (Single Active Tab) */}
          <div className="rehearsal-ticket__tabs" role="tablist" aria-label="Last Practiced Scenario">
            <button
              role="tab"
              aria-selected="true"
              className="rehearsal-ticket__tab is-active"
              tabIndex={-1}
            >
              01 / Interview
            </button>
            <button
              role="tab"
              aria-selected="false"
              className="rehearsal-ticket__tab"
              tabIndex={-1}
              style={{ opacity: 0.65, cursor: 'default' }}
            >
              02 / Conflict
            </button>
            <button
              role="tab"
              aria-selected="false"
              className="rehearsal-ticket__tab"
              tabIndex={-1}
              style={{ opacity: 0.65, cursor: 'default' }}
            >
              03 / Boundary
            </button>
          </div>

          <div className="rehearsal-ticket__tagline">
            <span className="rehearsal-ticket__bullet">✦</span>
            <span>Last Practiced · Executive Interview (Senior Lead)</span>
          </div>

          {/* Dialogue Transcript Inset */}
          <div className="rehearsal-ticket__transcript">
            {/* Partner Standby Prompt */}
            <div className="rehearsal-ticket__turn rehearsal-ticket__turn--partner">
              <div className="rehearsal-ticket__turn-label">
                <span className="rehearsal-ticket__role">AI Partner (Hiring Chair)</span>
                <span className="rehearsal-ticket__status">Awaiting Reply</span>
              </div>
              <p className="rehearsal-ticket__speech rehearsal-ticket__speech--partner">
                “Welcome back. Whenever you're ready, let's resume with behavioral question three.”
              </p>
            </div>

            {/* Remembered Delivery / Welcome Back typing */}
            <div className="rehearsal-ticket__turn rehearsal-ticket__turn--user">
              <div className="rehearsal-ticket__turn-label">
                <span className="rehearsal-ticket__role">Your Practice Delivery</span>
                <span className="rehearsal-ticket__status">Standby</span>
              </div>
              <div className="rehearsal-ticket__speech rehearsal-ticket__speech--user">
                <span>{displayedText}</span>
                <span className={`rehearsal-ticket__cursor ${isTypingComplete ? 'is-blinking' : ''}`}>▍</span>
              </div>
            </div>
          </div>

          {/* Card Footer Analysis with Desaturated Blue-Grey Status Tone */}
          <div className="rehearsal-ticket__footer">
            <div className="rehearsal-ticket__metric">
              <span className="rehearsal-ticket__metric-label">STATUS</span>
              <span
                className="rehearsal-ticket__metric-val"
                style={{
                  color: '#4A6B82',
                  backgroundColor: 'rgba(74, 107, 130, 0.12)'
                }}
              >
                Last session · 3 days ago
              </span>
            </div>
            <div className="rehearsal-ticket__annotation">
              Saved Draft № 04 · Ready to resume
            </div>
          </div>
        </div>

        {/* Perforated torn bottom edge */}
        <div className="rehearsal-ticket__tear-bottom" aria-hidden="true" />
      </div>
    </div>
  );
};

export default LoginRehearsalTicket;
