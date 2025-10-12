"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
  type: "opening" | "closing";
  variant?: "default" | "compact"; // Nouveau: style compact pour EventsPreview
}

export default function Countdown({
  targetDate,
  type,
  variant = "default",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference =
        new Date(targetDate.replace("Z", "")).getTime() - new Date().getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
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

  // Version compacte pour EventsPreview
  if (variant === "compact") {
    return (
      <div className="inline-flex items-center space-x-2 text-sm font-crimson">
        <span
          className={`${
            type === "opening" ? "text-gold" : "text-burgundy-light"
          } font-medium`}
        >
          {type === "opening" ? "Ouvre dans" : "Ferme dans"}
        </span>
        <span className="text-gold font-bold tabular-nums">
          {days}j {hours}h {minutes}m {seconds}s
        </span>
      </div>
    );
  }

  // Version par défaut avec boîtes pour Hero
  const units = [
    { value: days, label: "Jours" },
    { value: hours, label: "Heures" },
    { value: minutes, label: "Min" },
    { value: seconds, label: "Sec" },
  ];

  return (
    <div className="inline-flex flex-col items-center space-y-4">
      {/* Titre avec ornements */}
      <div className="flex items-center space-x-3">
        <span className="text-gold text-sm">✦</span>
        <span
          className={`text-sm font-cinzel tracking-[0.25em] uppercase ${
            type === "opening" ? "text-gold" : "text-burgundy-light"
          }`}
        >
          {type === "opening" ? "Ouverture dans" : "Fermeture dans"}
        </span>
        <span className="text-gold text-sm">✦</span>
      </div>

      {/* Boîtes du compteur */}
      <div className="flex items-center gap-2 md:gap-3">
        {units.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-2 md:gap-3">
            {/* Boîte */}
            <div className="relative group">
              {/* Fond avec bordure dorée */}
              <div className="relative bg-ink/40 border-2 border-gold/30 px-3 py-2 md:px-4 md:py-3 backdrop-blur-sm transition-all duration-300 group-hover:border-gold/60 group-hover:bg-ink/60">
                {/* Ornements de coin */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-gold/60"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-gold/60"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-gold/60"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-gold/60"></div>

                {/* Contenu */}
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-3xl md:text-4xl font-bold font-cinzel text-gold tabular-nums leading-none">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] md:text-xs font-cinzel tracking-wider uppercase text-stone-light">
                    {unit.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Séparateur entre les boîtes */}
            {index < units.length - 1 && (
              <span className="text-2xl text-gold/40 font-cinzel">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
