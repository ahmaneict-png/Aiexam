
import React from 'react';

interface HeaderProps {
  onHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHome }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={onHome} className="flex items-center space-x-3 group text-left">
          <div className="p-1.5 bg-[#8e1b2e] rounded-lg group-hover:rotate-6 transition-transform shadow-md shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-sm md:text-lg font-black text-[#8e1b2e] leading-tight">
            यशवंतराव चव्हाण विद्यालय, यशवंतनगर <br className="hidden md:block" />
            <span className="text-xs md:text-sm font-bold text-slate-500 tracking-tighter">ता. कराड जि. सातारा</span>
          </h1>
        </button>
      </div>
    </header>
  );
};

export default Header;
