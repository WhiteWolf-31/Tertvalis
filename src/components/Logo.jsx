import React from 'react';

export default function Logo({ collapsed = false, size = 'md' }) {
  const iconDimensions = size === 'lg' ? 'w-9 h-9' : 'w-8 h-8';
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center gap-2.5 select-none shrink-0">
      <div
        className={`${iconDimensions} rounded-lg bg-[#050FD8] flex items-center justify-center text-white shadow-xs shrink-0 relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6H20M12 6V19M7 14L12 10L17 14"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="18" r="2.2" fill="#05F2AD" />
        </svg>
      </div>
      {!collapsed && (
        <span
          className={`font-heading font-bold tracking-tight text-[#0D0D0D] ${textSize} whitespace-nowrap shrink-0`}
        >
          Tertvalis
        </span>
      )}
    </div>
  );
}
