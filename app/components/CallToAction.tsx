"use client";

import Link from "next/link";

export default function CallToAction() {
  return (
    <section id="contact" className="py-20 md:py-32 bg-parchment-texture relative overflow-hidden">
      {/* Motifs décoratifs */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>

      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-px bg-gold"></div>
              <span className="text-xl text-gold">✦</span>
              <div className="w-12 h-px bg-gold"></div>
            </div>

            <p className="text-sm font-cinzel tracking-[0.3em] uppercase text-stone mb-6">
              Rejoignez-nous
            </p>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-cinzel font-bold text-ink mb-6">
              Manquez Aucune
              <br />
              <span className="text-gold">Célébration</span>
            </h2>

            <p className="text-lg text-stone font-crimson max-w-2xl mx-auto leading-relaxed">
              Créez votre compte et accédez à nos événements exclusifs.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6">
            <Link
              href="/inscription"
              className="inline-block btn-medieval-primary px-12 py-4 text-base"
            >
              CRÉER MON COMPTE
            </Link>

            <p className="text-sm text-stone font-crimson">
              Déjà membre ?{" "}
              <Link href="/connexion" className="text-gold hover:text-gold-dark font-semibold transition-colors">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Avantages */}
          <div className="mt-16 pt-12 border-t border-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center p-6 card-medieval bg-parchment">
                <div className="text-3xl mb-3">✨</div>
                <p className="text-xs font-cinzel tracking-widest uppercase text-gold mb-2">
                  Gratuit
                </p>
                <p className="text-ink font-crimson text-sm">
                  Inscription et galeries incluses
                </p>
              </div>
              <div className="text-center p-6 card-medieval bg-parchment">
                <div className="text-3xl mb-3">🛡</div>
                <p className="text-xs font-cinzel tracking-widest uppercase text-gold mb-2">
                  Sécurisé
                </p>
                <p className="text-ink font-crimson text-sm">
                  Galeries privées et protégées
                </p>
              </div>
              <div className="text-center p-6 card-medieval bg-parchment">
                <div className="text-3xl mb-3">♾️</div>
                <p className="text-xs font-cinzel tracking-widest uppercase text-gold mb-2">
                  Illimité
                </p>
                <p className="text-ink font-crimson text-sm">
                  Uploads de médias sans limite
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ornement bas */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
    </section>
  );
}
