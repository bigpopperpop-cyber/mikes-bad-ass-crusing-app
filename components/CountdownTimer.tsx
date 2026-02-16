
import React, { useState, useEffect } from 'react';
import type { CountdownState } from '../types';

interface Props {
  targetDateString: string;
}

export const CountdownTimer: React.FC<Props> = ({ targetDateString }) => {
  const [timeLeft, setTimeLeft] = useState<CountdownState | null>(null);

  useEffect(() => {
    // Add time component to ensure it's treated as local midnight or specific time
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
    <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl transition-all"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2">Upcoming Milestone</h4>
          <h2 className="text-3xl font-black">High School Graduation Trip</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Bon Voyage: {new Date(targetDateString + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Secs', value: timeLeft.seconds },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <span className="text-2xl md:text-5xl font-black text-white tabular-nums">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs font-bold uppercase text-slate-500 mt-1 tracking-widest">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
