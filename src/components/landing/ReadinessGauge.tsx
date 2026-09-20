import React, { useState } from 'react';
import './ReadinessGauge.css';

interface CalibrationStage {
  level: number;
  label: string;
  verdict: string;
  notes: string;
  clarity: number;
  composure: number;
  tone: number;
}

const CALIBRATIONS: CalibrationStage[] = [
  {
    level: 38,
    label: 'Stage I · Initial Take',
    verdict: 'Hesitant / Reactive',
    notes: 'Filler phrases detected; defensive tone under sharp questioning.',
    clarity: 45,
    composure: 35,
    tone: 40
  },
  {
    level: 72,
    label: 'Stage II · Second Pass',
    verdict: 'Constructive / Grounded',
    notes: 'Firm pacing established; core rationale clearly articulated.',
    clarity: 78,
    composure: 70,
    tone: 75
  },
  {
    level: 94,
    label: 'Stage III · Rehearsed State',
    verdict: 'Fluent & High Composure',
    notes: 'Ready for the real encounter. Unshakable boundary delivery.',
    clarity: 96,
    composure: 92,
    tone: 94
  }
];

export const ReadinessGauge: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(2);
  const active = CALIBRATIONS[stageIndex];

  return (
    <div className="readiness-gauge-module">
      <div className="readiness-gauge-module__header">
        <div className="readiness-gauge-module__masthead">
          <span className="readiness-gauge-module__label">INSTRUMENT SPECIFICATION № 409</span>
          <h3 className="readiness-gauge-module__title">The Readiness Gauge</h3>
        </div>
        <div className="readiness-gauge-module__status">
          <span className="readiness-gauge-module__indicator" />
          <span>ACTIVE CALIBRATION</span>
        </div>
      </div>

      <p className="readiness-gauge-module__caption">
        A rehearsal session is not scored like a test. It is measured like an instrument dial — tracking
        the gradual settling of cognitive composure and clarity from raw draft to natural fluency.
      </p>

      {/* Stage Selector Buttons */}
      <div className="readiness-gauge__stepper" role="group" aria-label="Calibration Stages">
        {CALIBRATIONS.map((c, idx) => (
          <button
            key={c.label}
            className={`readiness-gauge__step-btn ${idx === stageIndex ? 'is-active' : ''}`}
            onClick={() => setStageIndex(idx)}
          >
            <span className="readiness-gauge__step-num">0{idx + 1}</span>
            <span className="readiness-gauge__step-txt">{c.label.split('·')[1]}</span>
          </button>
        ))}
      </div>

      {/* Dial Enclosure */}
      <div className="readiness-dial">
        <div className="readiness-dial__top">
          <span className="readiness-dial__verdict-tag">{active.verdict}</span>
          <span className="readiness-dial__numeric">{active.level}%</span>
        </div>

        {/* Liquid Horizontal Meter with Wave SVG */}
        <div className="readiness-dial__meter-well">
          <div
            className="readiness-dial__fluid"
            style={{ width: `${active.level}%` }}
          >
            <div className="readiness-dial__wave" />
          </div>
          <div className="readiness-dial__ticks" aria-hidden="true">
            <span style={{ left: '0%' }}>0</span>
            <span style={{ left: '25%' }}>25</span>
            <span style={{ left: '50%' }}>50</span>
            <span style={{ left: '75%' }}>75</span>
            <span style={{ left: '100%' }}>100</span>
          </div>
        </div>

        {/* Dimension Sub-gauges */}
        <div className="readiness-dial__dimensions">
          <div className="readiness-dial__dimension">
            <span className="readiness-dial__dim-name">CLARITY</span>
            <span className="readiness-dial__dim-val">{active.clarity}%</span>
            <div className="readiness-dial__dim-bar">
              <div style={{ width: `${active.clarity}%` }} />
            </div>
          </div>

          <div className="readiness-dial__dimension">
            <span className="readiness-dial__dim-name">COMPOSURE</span>
            <span className="readiness-dial__dim-val">{active.composure}%</span>
            <div className="readiness-dial__dim-bar">
              <div style={{ width: `${active.composure}%` }} />
            </div>
          </div>

          <div className="readiness-dial__dimension">
            <span className="readiness-dial__dim-name">TONE & TACT</span>
            <span className="readiness-dial__dim-val">{active.tone}%</span>
            <div className="readiness-dial__dim-bar">
              <div style={{ width: `${active.tone}%` }} />
            </div>
          </div>
        </div>

        <div className="readiness-dial__notes">
          <span className="readiness-dial__notes-lead">OBSERVATION:</span> {active.notes}
        </div>
      </div>
    </div>
  );
};

export default ReadinessGauge;
