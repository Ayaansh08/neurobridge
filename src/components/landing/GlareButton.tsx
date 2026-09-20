import React, { useRef, useState } from 'react';
import './GlareButton.css';

interface GlareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'editorial';
  className?: string;
}

export const GlareButton: React.FC<GlareButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <button
      ref={btnRef}
      className={`glare-button glare-button--${variant} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      <span
        className="glare-button__sheen"
        style={{
          left: `${glarePos.x}%`,
          top: `${glarePos.y}%`,
          opacity: glarePos.opacity
        }}
        aria-hidden="true"
      />
      <span className="glare-button__label">{children}</span>
    </button>
  );
};

export default GlareButton;
