import React, { useEffect, useState, useRef } from 'react';

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 18,
  direction = 'vertical',
  reverse = false,
  delay = 0,
  stagger = 0,
  duration = 450,
  ease = 'cubic-bezier(0.16, 1, 0.3, 1)',
  className = '',
  style = {},
}) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.getAttribute('data-motion') === 'reduced'
    );
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 20 + delay);

    return () => clearTimeout(timer);
  }, [delay, isVisible]);

  const offset = reverse ? -distance : distance;
  const transformStart =
    direction === 'vertical' ? `translate3d(0, ${offset}px, 0)` : `translate3d(${offset}px, 0, 0)`;

  // If children is an array and stagger > 0, wrap each child with a staggered transition
  if (Array.isArray(children) && stagger > 0) {
    return (
      <div ref={containerRef} className={className} style={style}>
        {children.map((child, index) => {
          if (!React.isValidElement(child)) return child;
          const childDelay = index * stagger;
          return (
            <div
              key={child.key || index}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate3d(0, 0, 0)' : transformStart,
                transition: `opacity ${duration}ms ${ease} ${childDelay}ms, transform ${duration}ms ${ease} ${childDelay}ms`,
                willChange: 'opacity, transform',
              }}
            >
              {child}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : transformStart,
        transition: `opacity ${duration}ms ${ease} 0ms, transform ${duration}ms ${ease} 0ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedContent;
