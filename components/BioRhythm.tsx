
import React, { useState, useEffect } from 'react';

interface BioRhythmProps {
    birthDate?: string; // YYMMDD
}

const BioRhythm: React.FC<BioRhythmProps> = ({ birthDate }) => {
  const [rhythms, setRhythms] = useState({ physical: 0, emotional: 0, intellectual: 0 });
  const [average, setAverage] = useState(0);

  useEffect(() => {
    if (!birthDate || birthDate.length !== 6) {
        // Fallback for demo if no birthdate
        setAverage(Math.floor(Math.random() * 40) + 40);
        return;
    }

    try {
        // Parse Birthdate (YYMMDD)
        let year = parseInt(birthDate.substring(0, 2));
        const month = parseInt(birthDate.substring(2, 4)) - 1; // Month is 0-indexed
        const day = parseInt(birthDate.substring(4, 6));

        // Guess century (Assuming < 40 is 2000s, else 1900s for simplicity)
        year += year < 40 ? 2000 : 1900;

        const birth = new Date(year, month, day);
        const today = new Date();
        
        // Calculate days alive
        const diffTime = Math.abs(today.getTime() - birth.getTime());
        const daysAlive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate Rhythms (Sine Waves)
        // Physical: 23 days, Emotional: 28 days, Intellectual: 33 days
        // Formula: sin(2 * PI * t / cycle) * 100
        const physical = Math.sin((2 * Math.PI * daysAlive) / 23) * 100;
        const emotional = Math.sin((2 * Math.PI * daysAlive) / 28) * 100;
        const intellectual = Math.sin((2 * Math.PI * daysAlive) / 33) * 100;

        // Normalize to 0-100 for easy display
        const pNorm = Math.round((physical + 100) / 2);
        const eNorm = Math.round((emotional + 100) / 2);
        const iNorm = Math.round((intellectual + 100) / 2);
        
        setRhythms({ physical: pNorm, emotional: eNorm, intellectual: iNorm });
        setAverage(Math.round((pNorm + eNorm + iNorm) / 3));

    } catch (e) {
        console.error("Biorhythm calculation error", e);
    }
  }, [birthDate]);

  const getColor = (level: number) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const radius = 14.5; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (average / 100) * circumference;

  return (
    <div className="relative group cursor-help flex items-center justify-center">
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-40 bg-slate-900 text-white text-xs rounded-lg py-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100] shadow-xl border border-slate-700">
        <p className="font-bold border-b border-slate-700 pb-2 mb-2 text-center text-indigo-300">오늘의 바이오리듬</p>
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-green-400 font-medium">신체(P)</span>
                <span className="font-bold">{rhythms.physical}%</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-red-400 font-medium">감성(E)</span>
                <span className="font-bold">{rhythms.emotional}%</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-blue-400 font-medium">지성(I)</span>
                <span className="font-bold">{rhythms.intellectual}%</span>
            </div>
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>

      {/* Circular Chart */}
      <div className="relative w-9 h-9">
        <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${getColor(average)} transition-all duration-1000 ease-out`}
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className={`w-4 h-4 ${getColor(average)} transition-colors duration-300`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default BioRhythm;
