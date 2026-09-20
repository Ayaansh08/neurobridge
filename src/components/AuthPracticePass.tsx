import React, { useEffect, useState } from 'react';

const passLines = [
  'Your first session is completely private',
  'No conversation is saved without your permission',
  'Practice aloud, reset quietly, return when ready',
];

export const AuthPracticePass: React.FC = () => {
  const [lineIndex, setLineIndex] = useState(0);
  const [typedText, setTypedText] = useState(passLines[0]);

  useEffect(() => {
    const currentLine = passLines[lineIndex];
    let nextChar = 0;

    const typingTimer = window.setInterval(() => {
      setTypedText(currentLine.slice(0, nextChar));
      nextChar += 1;

      if (nextChar >= currentLine.length) {
        window.clearInterval(typingTimer);
      }
    }, lineIndex === 0 ? 0 : 34);

    return () => window.clearInterval(typingTimer);
  }, [lineIndex]);

  useEffect(() => {
    const rotateTimer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % passLines.length);
    }, 4600);

    return () => window.clearInterval(rotateTimer);
  }, []);

  return (
    <div className="auth-practice-pass" aria-live="polite">
      <span className="auth-practice-pass__label">Practice pass</span>
      <span className="auth-practice-pass__copy">
        {typedText}
        <span className="auth-practice-pass__cursor" aria-hidden="true" />
      </span>
    </div>
  );
};

export default AuthPracticePass;
