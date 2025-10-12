"use client";

import Link from "next/link";

export default function MaintenancePage() {
  const handleRetry = () => {
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-ink via-ink-light to-ink flex items-center justify-center relative overflow-hidden">
      {/* Ornements de fond */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-10 text-9xl text-gold/20">⚜</div>
        <div className="absolute bottom-1/4 right-10 text-9xl text-gold/20">
          ⚜
        </div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 border-4 border-gold/30 bg-ink/40 backdrop-blur-sm relative">
            {/* Ornements de coin */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-gold/60"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-gold/60"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-gold/60"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-gold/60"></div>

            <span className="text-5xl">🛡</span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-px bg-gold/30"></div>
          <span className="text-gold text-xl">✦</span>
          <div className="w-16 h-px bg-gold/30"></div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-parchment mb-6">
          Site en Maintenance
        </h1>

        {/* Description */}
        <div className="space-y-4 mb-12">
          <p className="text-lg md:text-xl text-stone-light font-crimson leading-relaxed">
            Nos serveurs royaux sont temporairement indisponibles.
          </p>
          <p className="text-base text-stone font-crimson leading-relaxed max-w-md mx-auto">
            Nous travaillons activement à rétablir le service. Veuillez
            réessayer dans quelques instants ou contacter un administrateur si
            le problème persiste.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={handleRetry} className="btn-medieval-primary">
            Réessayer
          </button>
          <Link
            href="mailto:admin@premierdelan.com"
            className="btn-medieval-secondary"
          >
            Contacter un Admin
          </Link>
        </div>

        {/* Info supplémentaire */}
        <div className="mt-16 pt-8 border-t border-gold/20">
          <p className="text-xs text-stone-light font-crimson">
            Code d&apos;erreur :{" "}
            <span className="text-gold font-mono">API_UNAVAILABLE</span>
          </p>
        </div>
      </div>
    </main>
  );
}
