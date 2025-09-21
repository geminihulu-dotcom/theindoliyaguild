import React from 'react';

interface LoadingScreenProps {
  message: string;
  onClick: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, onClick }) => {
  return (
    <div 
      className="fixed inset-0 bg-[#02000c] flex flex-col items-center justify-center z-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-48 h-48">
        <svg className="absolute w-full h-full" viewBox="0 0 200 200">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="url(#glow)" className="animate-[pulse_2s_ease-in-out_infinite]" />
          <g className="animate-[spin_20s_linear_infinite]">
            <circle cx="100" cy="100" r="90" stroke="#4f46e5" strokeWidth="2" strokeDasharray="10 20" fill="none" />
          </g>
          <g className="animate-[spin_15s_linear_infinite_reverse]">
            <circle cx="100" cy="100" r="70" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="5 15" fill="none" />
          </g>
           <g className="animate-[spin_25s_linear_infinite]">
            <path d="M 100 10 L 120 40 L 100 70 L 80 40 Z" stroke="#c7d2fe" strokeWidth="1" fill="#4f46e5" fillOpacity="0.2" />
            <path d="M 100 190 L 120 160 L 100 130 L 80 160 Z" stroke="#c7d2fe" strokeWidth="1" fill="#4f46e5" fillOpacity="0.2" />
            <path d="M 10 100 L 40 120 L 70 100 L 40 80 Z" stroke="#c7d2fe" strokeWidth="1" fill="#4f46e5" fillOpacity="0.2" />
            <path d="M 190 100 L 160 120 L 130 100 L 160 80 Z" stroke="#c7d2fe" strokeWidth="1" fill="#4f46e5" fillOpacity="0.2" />
           </g>
        </svg>
      </div>
      <p className="mt-8 text-xl text-indigo-300 animate-[pulse_1.5s_ease-in-out_infinite] tracking-widest">{message}</p>
      <p className="absolute bottom-10 text-sm text-gray-500">Click anywhere to skip</p>
    </div>
  );
};

export default LoadingScreen;