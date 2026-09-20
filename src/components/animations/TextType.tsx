import React, { useState, useEffect } from 'react';

interface TextTypeProps {
  text: string | string[];
  typingSpeed?: number;
  initialDelay?: number;
  cursor?: boolean | string;
  className?: string;
  onComplete?: () => void;
}

export const TextType: React.FC<TextTypeProps> = ({
  text,
  typingSpeed = 22,
  initialDelay = 260,
  cursor = '▍',
  className = '',
  onComplete,
}) => {
  const fullText = Array.isArray(text) ? text.join('\n') : text;

  // Respect prefers-reduced-motion
  const [prefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [displayedText, setDisplayedText] = useState<string>(() =>
    prefersReducedMotion ? fullText : ''
  );
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    let charIndex = 0;
    let timer: ReturnType<typeof setTimeout>;

    const typeNextChar = () => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;
        // Slight organic jitter around base typingSpeed
        const jitter = Math.random() * 14 - 7;
        const delay = Math.max(10, typingSpeed + jitter);
        timer = setTimeout(typeNextChar, delay);
      } else {
        setIsTypingComplete(true);
        if (onComplete) onComplete();
      }
    };

    const startTimer = setTimeout(() => {
      setDisplayedText('');
      setIsTypingComplete(false);
      typeNextChar();
    }, initialDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [fullText, typingSpeed, initialDelay, prefersReducedMotion, onComplete]);

  return (
    <span className={`text-type-animation ${className}`}>
      <span>{displayedText}</span>
      {cursor && (
        <span
          className={`text-type-cursor ${isTypingComplete ? 'is-complete' : 'is-typing'}`}
          aria-hidden="true"
        >
          {typeof cursor === 'string' ? cursor : '▍'}
        </span>
      )}
    </span>
  );
};

export default TextType;
