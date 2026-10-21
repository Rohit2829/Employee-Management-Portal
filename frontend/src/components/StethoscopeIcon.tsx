import React from 'react';

interface StethoscopeIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export default function StethoscopeIcon({ size = '1.2em', className, ...props }: StethoscopeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...props.style }}
      {...props}
    >
      {/* Ear Tips (Binaural Ear Pieces) */}
      <path d="M 6.8,3 L 5.6,3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 17.2,3 L 18.4,3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />

      {/* Thin Upper Binaural Springs */}
      <path d="M 6.6,3 C 5,3 4.2,4.5 4.6,7 L 5.4,10.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M 17.4,3 C 19,3 19.8,4.5 19.4,7 L 18.6,10.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Thicker Lower Sleeves */}
      <path d="M 5.4,10.5 L 6.8,14.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 18.6,10.5 L 17.2,14.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Bottom Y-Junction Base */}
      <path d="M 6.8,14.5 C 7.6,16.5 11,17 12,17 C 13,17 16.4,16.5 17.2,14.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 12,17 L 12,18.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Curved Rubber Tube Loop */}
      <path d="M 12,18.5 C 12,21.5 15,22.2 16.8,22.2 C 18.6,22.2 19.8,20.8 19.8,18 L 19.8,12 C 19.8,9.5 21,8.5 22.2,8.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Chestpiece (Double-Ring Diaphragm) */}
      <circle cx="22.2" cy="8.5" r="2.2" stroke="currentColor" strokeWidth="0.8" fill="none" />
      <circle cx="22.2" cy="8.5" r="1.1" fill="currentColor" />
    </svg>
  );
}
