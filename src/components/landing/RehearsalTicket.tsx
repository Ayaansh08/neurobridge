import React, { useState, useEffect, useRef } from 'react';
import './RehearsalTicket.css';

interface ScenarioPreview {
  id: 'interview' | 'conflict' | 'boundary';
  label: string;
  tag: string;
  partnerRole: string;
  partnerPrompt: string;
  userReply: string;
  scoreMetric: string;
}

const SCENARIOS: ScenarioPreview[] = [
  {
    id: 'interview',
    label: '01 / Interview',
    tag: 'Executive Interview · Senior Lead',
    partnerRole: 'Hiring Committee Chair',
    partnerPrompt: '“Tell me about a time a project failed under your leadership, and what you took away from it.”',
    userReply: '“When our Q3 migration stalled, I owned the miscommunication early instead of defending the original timeline...”',
    scoreMetric: 'Composure: Grounded · 94% clarity'
  },
  {
    id: 'conflict',
    label: '02 / Conflict',
    tag: 'Workplace Tension · Peer Review',
    partnerRole: 'Project Stakeholder',
    partnerPrompt: '“I feel like your team bypassed our architecture review before committing these changes.”',
    userReply: '“I hear your concern. Let’s walk through the timeline together so we can align on the rollout and avoid any future gap...”',
    scoreMetric: 'De-escalation: Strong · 91% alignment'
  },
  {
    id: 'boundary',
    label: '03 / Boundary',
    tag: 'Scope Negotiation · Client',
    partnerRole: 'Executive Sponsor',
    partnerPrompt: '“We really need this additional dashboard delivered before Friday’s board meeting.”',
    userReply: '“I can deliver the core metrics report by Friday, but adding the custom dashboard would compromise the test integrity...”',
    scoreMetric: 'Firmness: Assertive · 96% confidence'
  }
];

export const RehearsalTicket: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interview' | 'conflict' | 'boundary'>('interview');
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeScenario = SCENARIOS.find((s) => s.id === activeTab) || SCENARIOS[0];

  useEffect(() => {
    let index = 0;
    const fullText = activeScenario.userReply;
    let timer: ReturnType<typeof setTimeout>;

    const typeNextChar = () => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
        const speed = Math.random() * 20 + 18; // organic typing tempo
        timer = setTimeout(typeNextChar, speed);
      } else {
        setIsTypingComplete(true);
      }
    };

    const startDelay = setTimeout(() => {
      setDisplayedText('');
      setIsTypingComplete(false);
      typeNextChar();
    }, 280);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timer);
    };
  }, [activeTab, activeScenario.userReply]);

  return (
    <div className="rehearsal-ticket-wrapper" ref={containerRef}>
      <div className="rehearsal-ticket">
        {/* Perforated torn header edge */}
        <div className="rehearsal-ticket__tear-top" aria-hidden="true" />

        <div className="rehearsal-ticket__inner">
          {/* Card Meta Bar */}
          <div className="rehearsal-ticket__meta">
            <div className="rehearsal-ticket__folio">
              <span className="rehearsal-ticket__stamp">FOLIO № 842-B</span>
              <span className="rehearsal-ticket__dept">REHEARSAL ARCHIVE</span>
            </div>
            <div className="rehearsal-ticket__state-pill">LIVE SESSION</div>
          </div>

          {/* Scenario Tab Buttons */}
          <div className="rehearsal-ticket__tabs" role="tablist" aria-label="Rehearsal Scenarios">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                role="tab"
                aria-selected={activeTab === scenario.id}
                className={`rehearsal-ticket__tab ${activeTab === scenario.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(scenario.id)}
              >
                {scenario.label}
              </button>
            ))}
          </div>

          <div className="rehearsal-ticket__tagline">
            <span className="rehearsal-ticket__bullet">✦</span>
            <span>{activeScenario.tag}</span>
          </div>

          {/* Dialogue Transcript Inset */}
          <div className="rehearsal-ticket__transcript">
            {/* AI Partner Turn */}
            <div className="rehearsal-ticket__turn rehearsal-ticket__turn--partner">
              <div className="rehearsal-ticket__turn-label">
                <span className="rehearsal-ticket__role">{activeScenario.partnerRole}</span>
                <span className="rehearsal-ticket__status">Prompting</span>
              </div>
              <p className="rehearsal-ticket__speech rehearsal-ticket__speech--partner">
                {activeScenario.partnerPrompt}
              </p>
            </div>

            {/* User Rehearsal Turn */}
            <div className="rehearsal-ticket__turn rehearsal-ticket__turn--user">
              <div className="rehearsal-ticket__turn-label">
                <span className="rehearsal-ticket__role">Your Practice Delivery</span>
                <span className="rehearsal-ticket__status">Transcribing</span>
              </div>
              <div className="rehearsal-ticket__speech rehearsal-ticket__speech--user">
                <span>{displayedText}</span>
                <span className={`rehearsal-ticket__cursor ${isTypingComplete ? 'is-blinking' : ''}`}>▍</span>
              </div>
            </div>
          </div>

          {/* Card Footer Analysis */}
          <div className="rehearsal-ticket__footer">
            <div className="rehearsal-ticket__metric">
              <span className="rehearsal-ticket__metric-label">CALIBRATION</span>
              <span className="rehearsal-ticket__metric-val">{activeScenario.scoreMetric}</span>
            </div>
            <div className="rehearsal-ticket__annotation">
              Draft № 03 · Zero recorded latency
            </div>
          </div>
        </div>

        {/* Perforated torn bottom edge */}
        <div className="rehearsal-ticket__tear-bottom" aria-hidden="true" />
      </div>
    </div>
  );
};

export default RehearsalTicket;
