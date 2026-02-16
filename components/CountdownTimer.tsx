import React, { useState, useEffect } from 'react';
import type { CountdownState } from '../types';

interface Props {
  targetDateString: string;
}

export const CountdownTimer: React.FC<Props> = ({ targetDateString }) => {
  const [timeLeft, setTimeLeft] = useState<CountdownState | null>(null);

  useEffect(() => {
    const targetDate = new Date(targetDateString + 'T00:00:00').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDateString]);

  if (!timeLeft) return null;

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl overflow-hidden relative group border-b-4 border-blue-600">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl transition-all"></div>
      
      <div className="relative z-10 flex flex-col xl:flex-row items-center xl:items-end justify-between gap-10">
        <div className="text-center xl:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 px-3 py-1 rounded-full mb-3">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <h4 className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">Countdown to Departure</h4>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2">High School Graduation Trip</h2>
          <p className="text-slate-400 text-sm font-bold flex items-center justify-center xl:justify-start gap-2">
            Sail Date: {new Date(targetDateString + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Improved grid scaling: col-gap adjusts from 2 to 10 depending on screen width */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Secs', value: timeLeft.seconds },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center min-w-[55px] sm:min-w-[70px] md:min-w-[80px]">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tabular-nums tracking-tighter">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[8px] sm:text-[10px] md:text-[11px] font-black uppercase text-slate-500 mt-1 tracking-[0.2em]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};