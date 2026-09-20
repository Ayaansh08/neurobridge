import React from 'react';
import './ClippingStrip.css';

interface DialogueSnippet {
  id: string;
  category: string;
  text: string;
  source: string;
  rotation: number;
}

const SNIPPETS: DialogueSnippet[] = [
  {
    id: 's1',
    category: 'BOUNDARIES',
    text: '“I need to set a boundary about after-hours alerts—”',
    source: 'Workplace · Folio 12',
    rotation: -1.2
  },
  {
    id: 's2',
    category: 'COMPENSATION',
    text: '“Based on the scope increase, let’s revisit my base salary—”',
    source: 'Negotiation · Folio 07',
    rotation: 1.5
  },
  {
    id: 's3',
    category: 'CONFLICT',
    text: '“I don’t agree with how this feedback was framed.”',
    source: 'Review · Folio 19',
    rotation: -0.8
  },
  {
    id: 's4',
    category: 'LEADERSHIP',
    text: '“I hear your concern, but we cannot compromise on test safety—”',
    source: 'Stakeholders · Folio 31',
    rotation: 1.1
  },
  {
    id: 's5',
    category: 'PERFORMANCE',
    text: '“I need clear milestones before committing to this deadline—”',
    source: 'Project Scope · Folio 04',
    rotation: -1.4
  },
  {
    id: 's6',
    category: 'DIFFICULT PEER',
    text: '“When you spoke over me in the sync, it undermined the proposal.”',
    source: 'Team Dynamic · Folio 28',
    rotation: 0.9
  }
];

export const ClippingStrip: React.FC = () => {
  return (
    <div className="clipping-strip-container" aria-label="Sample Rehearsal Clippings">
      <div className="clipping-strip-header">
        <span className="clipping-strip-header__line" />
        <span className="clipping-strip-header__title">ARCHIVED DIALOGUE CLIPPINGS · TRANSCRIPT FRAGMENTS</span>
        <span className="clipping-strip-header__line" />
      </div>

      <div className="clipping-strip-track-wrapper">
        <div className="clipping-strip-track">
          {/* Loop twice for seamless marquee */}
          {[...SNIPPETS, ...SNIPPETS].map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="clipping-card"
              style={{ '--clip-rot': `${item.rotation}deg` } as React.CSSProperties}
            >
              <div className="clipping-card__meta">
                <span className="clipping-card__category">{item.category}</span>
                <span className="clipping-card__source">{item.source}</span>
              </div>
              <p className="clipping-card__text">{item.text}</p>
              <div className="clipping-card__notch" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClippingStrip;
