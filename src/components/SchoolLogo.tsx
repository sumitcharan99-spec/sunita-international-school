/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'color';
}

export default function SchoolLogo({ 
  className = '', 
  size = 'md', 
  variant = 'color' 
}: SchoolLogoProps) {
  
  // Dimensions map
  const sizeMap = {
    sm: { width: 44, height: 44, textClass: 'text-xs md:text-sm' },
    md: { width: 72, height: 72, textClass: 'text-sm md:text-base' },
    lg: { width: 128, height: 128, textClass: 'text-base md:text-lg' }
  };

  const { width, height } = sizeMap[size];

  // We can render a high-fidelity SVG crest representing:
  // - Laurel leaves (gold) on the left and right
  // - Gold rising sun with rays
  // - White open book
  // - Bold "SUNITA" text
  // - Dark blue shield with gold outline
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md filter transition-transform hover:scale-105 duration-300"
      >
        {/* Shield Outer Path with Dark Navy and Gold Border */}
        <path 
          d="M 30,30 L 170,30 C 170,110 155,160 100,185 C 45,160 30,110 30,30 Z" 
          fill="#0B2545" 
          stroke="#EEB902" 
          strokeWidth="6" 
          strokeLinejoin="round"
        />

        {/* Shield Inner Inset Line */}
        <path 
          d="M 38,38 L 162,38 C 162,105 149,149 100,173 C 51,149 38,105 38,38 Z" 
          fill="#134074" 
          stroke="#EEB902" 
          strokeWidth="1.5" 
          strokeOpacity="0.4"
        />

        {/* Gold Rising Sun & Rays */}
        <g id="rising-sun">
          {/* Central Sun Circle */}
          <path 
            d="M 60,115 A 40,40 0 0,1 140,115 Z" 
            fill="#EEB902" 
          />
          {/* Sun Rays */}
          {[
            -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75
          ].map((angle, idx) => {
            const rad = (angle * Math.PI) / 180;
            const startX = 100 + Math.cos(rad) * 42;
            const startY = 115 + Math.sin(rad) * 42;
            const endX = 100 + Math.cos(rad) * 58;
            const endY = 115 + Math.sin(rad) * 58;
            return (
              <line 
                key={idx}
                x1={startX} 
                y1={startY} 
                x2={endX} 
                y2={endY} 
                stroke="#EEB902" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
            );
          })}
        </g>

        {/* Golden Laurel Wreaths Flanking the Crest */}
        <g id="laurels" stroke="#EEB902" strokeWidth="2" fill="#EEB902" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Laurel Branch */}
          <path d="M 45,120 Q 35,80 50,45" fill="none" strokeWidth="3" />
          {/* Left Laurel Leaves */}
          <path d="M 45,110 C 35,110 32,98 42,98 Z" />
          <path d="M 42,92 C 30,92 28,80 38,80 Z" />
          <path d="M 40,74 C 28,74 26,62 36,62 Z" />
          <path d="M 44,56 C 32,56 32,44 42,44 Z" />
          <path d="M 50,45 C 42,39 44,29 52,34 Z" />

          {/* Right Laurel Branch */}
          <path d="M 155,120 Q 165,80 150,45" fill="none" strokeWidth="3" />
          {/* Right Laurel Leaves */}
          <path d="M 155,110 C 165,110 168,98 158,98 Z" />
          <path d="M 158,92 C 170,92 172,80 162,80 Z" />
          <path d="M 160,74 C 172,74 174,62 164,62 Z" />
          <path d="M 156,56 C 168,56 168,44 158,44 Z" />
          <path d="M 150,45 C 158,39 156,29 148,34 Z" />
        </g>

        {/* White Open Book at the Base of the Crest */}
        <g id="open-book">
          {/* Shadow/Outline */}
          <path 
            d="M 100,135 Q 125,120 155,130 L 155,112 Q 125,102 100,117 Q 75,102 45,112 L 45,130 Q 75,120 100,135 Z" 
            fill="#091E36"
          />
          {/* White Page base */}
          <path 
            d="M 100,132 Q 125,117 152,127 L 152,110 Q 125,100 100,114 Q 75,100 48,110 L 48,127 Q 75,117 100,132 Z" 
            fill="#FFFFFF" 
            stroke="#EEB902" 
            strokeWidth="2" 
            strokeLinejoin="round"
          />
          {/* Center Spine Page Line */}
          <line x1="100" y1="114" x2="100" y2="132" stroke="#0B2545" strokeWidth="2" />
        </g>

        {/* Title overlays "SUNITA" */}
        <text 
          x="100" 
          y="76" 
          fill="#FFFFFF" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="24" 
          fontWeight="900" 
          letterSpacing="2"
          textAnchor="middle"
          style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.7)' }}
        >
          SUNITA
        </text>

        {/* Secondary Banner at bottom representing "INTERNATIONAL SCHOOL" banner */}
        <path 
          d="M 35,138 L 165,138 C 165,138 155,164 100,166 C 45,164 35,138 35,138 Z" 
          fill="#EEB902" 
          stroke="#091E36" 
          strokeWidth="1.5" 
          strokeLinejoin="round"
        />
        
        {/* Banner Texts: "INTERNATIONAL" */}
        <text 
          x="100" 
          y="150" 
          fill="#0B2545" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="9" 
          fontWeight="900" 
          letterSpacing="0.8"
          textAnchor="middle"
        >
          INTERNATIONAL SCHOOL
        </text>

        {/* Small Golden Scroll Motto: "Empowering Minds" */}
        <text 
          x="100" 
          y="160" 
          fill="#0B2545" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="6.5" 
          fontWeight="bold" 
          letterSpacing="0.2"
          textAnchor="middle"
          className="italic"
        >
          Empowering Minds, Shaping Futures
        </text>
      </svg>

      {/* Accompanying Styled Wordmark */}
      <div className="flex flex-col text-left justify-center">
        <span className={`block uppercase font-black tracking-widest ${
          variant === 'light' ? 'text-[#0B2545]' : 'text-white'
        } ${
          size === 'sm' ? 'text-lg leading-tight' : size === 'md' ? 'text-xl md:text-2xl leading-none' : 'text-3xl leading-none'
        }`}>
          SUNITA
        </span>
        <span className={`block uppercase font-mono tracking-wider font-extrabold ${
          variant === 'light' ? 'text-emerald-950/85' : 'text-[#EEB902]'
        } ${
          size === 'sm' ? 'text-[9px]' : 'text-[10px] md:text-xs mt-0.5'
        }`}>
          International School
        </span>
      </div>
    </div>
  );
}
