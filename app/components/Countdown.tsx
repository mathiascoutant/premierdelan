'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
  type: 'opening' | 'closing';
}

export default function Countdown({ targetDate, type }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Ignorer le Z pour traiter comme heure locale
      const targetDateLocal = targetDate.replace('Z', '');
      const difference = new Date(targetDateLocal).getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      
      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return null;
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      {type === 'opening' ? (
        <span className="text-orange-600 font-medium">
          Ouvre dans :
        </span>
      ) : (
        <span className="text-green-600 font-medium">
          Ferme dans :
        </span>
      )}
      
      <div className="flex items-center gap-1">
        {days > 0 && (
          <>
            <span className="font-mono font-medium">{days}j</span>
            <span className="text-gray-400">:</span>
          </>
        )}
        {(days > 0 || hours > 0) && (
          <>
            <span className="font-mono font-medium">{hours}h</span>
            {days === 0 && (
              <>
                <span className="text-gray-400">:</span>
                <span className="font-mono font-medium">{minutes}m</span>
              </>
            )}
          </>
        )}
        {days === 0 && hours === 0 && (
          <>
            <span className="font-mono font-medium">{minutes}m</span>
            <span className="text-gray-400">:</span>
            <span className="font-mono font-medium">{seconds}s</span>
          </>
        )}
      </div>
    </div>
  );
}

