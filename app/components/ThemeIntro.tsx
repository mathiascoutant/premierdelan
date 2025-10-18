"use client";

import { useEffect, useRef, useState } from "react";

export default function ThemeIntro() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-gradient-to-b from-[#f5efe0] to-[#faf6ed] overflow-hidden"
    >
      {/* Ornements décoratifs animés */}
      <div className="absolute top-20 left-10 md:left-20 text-7xl md:text-9xl text-[#d4af37]/10 animate-float pointer-events-none">
        🏰
      </div>
      <div className="absolute bottom-20 right-10 md:right-20 text-7xl md:text-9xl text-[#d4af37]/10 animate-float-delayed pointer-events-none">
        ⚔
      </div>

      <div className="section-container">
        <div className="max-w-5xl mx-auto">
          {/* Encadré principal luxueux */}
          <div
            className={`relative bg-gradient-to-br from-[#faf6ed] to-[#f5efe0] border-4 border-[#d4af37]/30 p-10 md:p-16 shadow-2xl transition-all duration-1000 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Coins ornés dorés */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#d4af37]"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#d4af37]"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#d4af37]"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#d4af37]"></div>

            {/* Badge central */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#faf6ed] px-6 py-2 border-2 border-[#d4af37]">
              <span className="text-[#d4af37] text-2xl">⚜</span>
            </div>

            {/* Contenu */}
            <div className="relative z-10 text-center space-y-8">
              {/* Titre élégant */}
              <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-[#1a1410] leading-tight">
                Une Soirée{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#c9a74f]">
                  Médiévale
                </span>{" "}
                d'Exception
              </h2>

              {/* Description */}
              <div className="space-y-6 text-[#1a1410]/80 font-crimson text-base md:text-xl leading-relaxed max-w-3xl mx-auto">
                <p>
                  Pour célébrer l'
                  <span className="text-[#d4af37] font-bold">
                    An de Grâce 2026
                  </span>
                  , nous vous convions à une{" "}
                  <span className="text-[#1a1410] font-bold">
                    soirée exceptionnelle
                  </span>{" "}
                  dans le cadre enchanteur de{" "}
                  <span className="text-[#d4af37] font-bold">Chamouillac</span>.
                </p>
                <p>
                  Le{" "}
                  <span className="text-[#1a1410] font-bold">
                    31 décembre 2025
                  </span>
                  , voyagez dans le temps et vivez une célébration digne des
                  plus grands banquets royaux. Costumes d'époque, décors
                  somptueux et animations médiévales vous attendent pour une
                  nuit magique.
                </p>
                <p className="text-[#d4af37] font-bold italic text-xl md:text-2xl pt-4 border-t border-[#d4af37]/20">
                  « Une nuit pour faire revivre l'histoire et forger des
                  souvenirs immortels »
                </p>
              </div>

              {/* Info pratiques - Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                <div className="group bg-[#f5efe0] border-2 border-[#d4af37]/20 p-6 hover:border-[#d4af37]/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">
                    📅
                  </div>
                  <p className="text-sm font-cinzel tracking-wider text-[#d4af37] uppercase font-bold mb-2">
                    Date
                  </p>
                  <p className="text-[#1a1410] font-crimson font-semibold">
                    31 Décembre 2025
                  </p>
                </div>
                <div className="group bg-[#f5efe0] border-2 border-[#d4af37]/20 p-6 hover:border-[#d4af37]/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">
                    🏰
                  </div>
                  <p className="text-sm font-cinzel tracking-wider text-[#d4af37] uppercase font-bold mb-2">
                    Lieu
                  </p>
                  <p className="text-[#1a1410] font-crimson font-semibold">
                    Chamouillac
                  </p>
                </div>
                <div className="group bg-[#f5efe0] border-2 border-[#d4af37]/20 p-6 hover:border-[#d4af37]/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">
                    👑
                  </div>
                  <p className="text-sm font-cinzel tracking-wider text-[#d4af37] uppercase font-bold mb-2">
                    Thème
                  </p>
                  <p className="text-[#1a1410] font-crimson font-semibold">
                    Médiéval Luxe
                  </p>
                </div>
              </div>

              {/* Ornement final */}
              <div className="flex items-center justify-center space-x-4 pt-8">
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#d4af37]/50"></div>
                <span className="text-[#d4af37] text-xl">❖</span>
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#d4af37]/50"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(-5deg);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 9s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
