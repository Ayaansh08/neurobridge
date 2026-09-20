import React from 'react';

interface SloshScoreGaugeProps {
  score: number;
  max?: number;
}

export const SloshScoreGauge: React.FC<SloshScoreGaugeProps> = ({ score, max = 12 }) => {
  const safeScore = Math.max(0, Math.min(score, max));
  const fillPercent = (safeScore / max) * 100;

  return (
    <div
      className="slosh-score-gauge"
      role="img"
      aria-label={`Session score ${safeScore} out of ${max}`}
      style={{ '--score-fill': `${fillPercent}%` } as React.CSSProperties}
    >
      <div className="slosh-score-gauge__liquid" aria-hidden="true">
        <span className="slosh-score-gauge__wave slosh-score-gauge__wave--front" />
        <span className="slosh-score-gauge__wave slosh-score-gauge__wave--back" />
      </div>
      <div className="slosh-score-gauge__value">
        <span>{safeScore}</span>
        <span className="slosh-score-gauge__max">/{max}</span>
      </div>
    </div>
  );
};

export default SloshScoreGauge;
