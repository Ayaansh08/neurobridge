import React, { useEffect, useState } from 'react';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  onAnimationComplete?: () => void;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 50,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
}) => {
  const [inView, setInView] = useState(() => {
    if (typeof window === 'undefined') return true;
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.getAttribute('data-motion') === 'reduced'
    );
  });

  useEffect(() => {
    if (inView) {
      onAnimationComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setInView(true);
      onAnimationComplete?.();
    }, 40);

    return () => clearTimeout(timer);
  }, [inView, onAnimationComplete]);

  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  return (
    <span className={`blur-text-wrapper ${className}`} style={{ display: 'inline-block' }}>
      {elements.map((element, index) => {
        const spanDelay = index * delay;
        const translateY = inView ? '0px' : direction === 'top' ? '-10px' : '10px';
        const filter = inView ? 'blur(0px)' : 'blur(6px)';
        const opacity = inView ? 1 : 0;

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              transition: `opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${spanDelay}ms, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${spanDelay}ms, filter 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${spanDelay}ms`,
              opacity,
              filter,
              transform: `translateY(${translateY})`,
              marginRight: animateBy === 'words' && index < elements.length - 1 ? '0.28em' : undefined,
              willChange: 'transform, opacity, filter',
            }}
          >
            {element === ' ' ? '\u00A0' : element}
          </span>
        );
      })}
    </span>
  );
};

export default BlurText;
