import React from 'react';
import { TextType } from '../animations/TextType';
import { GlareButton } from '../landing/GlareButton';

interface DashboardFolioTicketProps {
  onStartPractice?: () => void;
}

export const DashboardFolioTicket: React.FC<DashboardFolioTicketProps> = ({ onStartPractice }) => {
  const onboardingCopy =
    'Your practice stats, composure trends, and momentum streak will be cataloged here after your first rehearsal. Choose any scenario below to begin your low-pressure practice.';

  return (
    <div className="dashboard-folio-ticket-wrapper" role="region" aria-label="Onboarding Rehearsal Ticket">
      <div className="dashboard-folio-ticket">
        {/* Perforated torn header edge */}
        <div className="dashboard-folio-ticket__tear-top" aria-hidden="true" />

        <div className="dashboard-folio-ticket__inner">
          {/* Folio Metadata Bar */}
          <div className="dashboard-folio-ticket__meta">
            <div className="dashboard-folio-ticket__folio-group">
              <span className="dashboard-folio-ticket__stamp">FOLIO № 001</span>
              <span className="dashboard-folio-ticket__sep">·</span>
              <span className="dashboard-folio-ticket__dept">AWAITING FIRST ENTRY</span>
            </div>
            <div className="dashboard-folio-ticket__pill">STANDBY</div>
          </div>

          {/* Transcript / Reassurance Body */}
          <div className="dashboard-folio-ticket__body">
            <div className="dashboard-folio-ticket__turn-label">
              <span className="dashboard-folio-ticket__role">COACHING DISPATCH</span>
              <span className="dashboard-folio-ticket__status">READY</span>
            </div>
            <p className="dashboard-folio-ticket__message">
              <TextType
                text={onboardingCopy}
                typingSpeed={18}
                initialDelay={350}
                cursor="▍"
              />
            </p>
          </div>

          {/* Card Footer Calibration Strip */}
          <div className="dashboard-folio-ticket__footer">
            <div className="dashboard-folio-ticket__calibration">
              <span className="dashboard-folio-ticket__cal-label">CALIBRATION</span>
              <span className="dashboard-folio-ticket__cal-val">
                0 sessions logged · Ready when you are
              </span>
            </div>
            {onStartPractice && (
              <GlareButton
                variant="primary"
                className="dashboard-folio-ticket__cta"
                onClick={onStartPractice}
              >
                Start First Practice
              </GlareButton>
            )}
          </div>
        </div>

        {/* Perforated torn bottom edge */}
        <div className="dashboard-folio-ticket__tear-bottom" aria-hidden="true" />
      </div>
    </div>
  );
};

export default DashboardFolioTicket;
