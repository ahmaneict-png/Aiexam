
import React from 'react';

interface WelcomeScreenProps {
  onSelectTeacher: () => void;
  onSelectStudent: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectTeacher, onSelectStudent }) => {
  return (
    <div className="max-w-4xl w-full flex flex-col items-center">
      {/* Prominent Student Path */}
      <div className="w-full mb-12">
        <button 
          onClick={onSelectStudent}
          className="w-full group bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200 border-2 border-transparent hover:border-blue-600 transition-all text-center flex flex-col items-center transform hover:-translate-y-2"
        >
          {/* Updated Logo: Adjusted spelling to Sahyadri with short 'i' and repositioned text */}
          <div className="w-64 h-64 md:w-[30rem] md:h-[30rem] bg-transparent rounded-full flex items-center justify-center mb-10 relative group-hover:scale-105 transition-transform drop-shadow-2xl">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Outer Blue Ring */}
              <circle cx="200" cy="200" r="195" fill="white" stroke="#00008b" strokeWidth="8" />
              
              <defs>
                <clipPath id="sealInnerClip">
                  <circle cx="200" cy="200" r="188" />
                </clipPath>
              </defs>

              <g clipPath="url(#sealInnerClip)">
                {/* Background: School Building (Faded) */}
                <rect x="0" y="0" width="400" height="400" fill="#ffffff" />
                <image 
                  href="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800" 
                  x="0" y="50" width="400" height="300" 
                  preserveAspectRatio="xMidYMid slice"
                  opacity="0.1"
                />

                {/* Central Text Content - Ensuring "Sahyadri" is spelled correctly as requested */}
                <g transform="translate(200, 135)">
                  {/* Institution Name: Changed to सह्याद्रि */}
                  <text textAnchor="middle" className="text-[24px] font-black fill-slate-700 uppercase tracking-wide">
                    सह्याद्रि शिक्षण संस्थेचे
                  </text>
                  
                  {/* School Name - Red and Bold */}
                  <text 
                    y="75" 
                    textAnchor="middle" 
                    className="text-[54px] font-black fill-red-600"
                    style={{ filter: 'drop-shadow(0px 2px 0px white) drop-shadow(0px -2px 0px white) drop-shadow(2px 0px 0px white) drop-shadow(-2px 0px 0px white)' }}
                  >
                    यशवंतराव चव्हाण
                  </text>
                  <text 
                    y="135" 
                    textAnchor="middle" 
                    className="text-[54px] font-black fill-red-600"
                    style={{ filter: 'drop-shadow(0px 2px 0px white) drop-shadow(0px -2px 0px white) drop-shadow(2px 0px 0px white) drop-shadow(-2px 0px 0px white)' }}
                  >
                    विद्यालय
                  </text>
                  
                  {/* Address */}
                  <text y="185" textAnchor="middle" className="text-[22px] font-bold fill-blue-900">
                    यशवंतनगर, ता. कराड, जि. सातारा.
                  </text>
                </g>
              </g>

              {/* Inner Decorative Blue Ring */}
              <circle cx="200" cy="200" r="188" fill="none" stroke="#00008b" strokeWidth="2" opacity="0.15" />
            </svg>
          </div>

          <div className="flex flex-col items-center">
             <div className="flex items-center justify-center gap-4 mb-8">
              <span className="h-0.5 w-20 bg-gradient-to-r from-transparent to-red-600"></span>
              <p className="text-slate-600 text-lg md:text-3xl font-black uppercase tracking-[0.25em]">परीक्षा विभाग</p>
              <span className="h-0.5 w-20 bg-gradient-to-l from-transparent to-red-600"></span>
            </div>
            
            <div className="mt-4 px-16 py-7 bg-red-700 text-white text-3xl font-black rounded-[2.5rem] shadow-2xl group-hover:bg-red-800 transition-all group-hover:px-24 flex items-center gap-6 group-hover:gap-10 border-b-8 border-red-950 active:translate-y-2 active:border-b-0">
              सुरुवात करा
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <p className="mt-8 text-slate-400 font-bold text-base tracking-[0.2em] uppercase">डिजिटल स्कॉलरशिप टेस्ट पोर्टल</p>
          </div>
        </button>
      </div>

      {/* Subtle Teacher Path */}
      <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
        <button 
          onClick={onSelectTeacher}
          className="group flex items-center gap-4 text-slate-500 hover:text-blue-700 font-bold py-4 px-10 rounded-2xl border-2 border-slate-100 hover:border-blue-700 transition-all bg-white shadow-sm"
        >
          <div className="p-2 bg-slate-100 group-hover:bg-blue-700 group-hover:text-white rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-sm md:text-base uppercase tracking-widest">शिक्षकांसाठी खास विभाग (Login)</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
