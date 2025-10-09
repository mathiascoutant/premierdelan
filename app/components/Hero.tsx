'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center bg-white">
      {/* Content */}
      <div className="section-container py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-black leading-none">
              Vivez & Partagez
              <br />
              <span className="font-normal">
                vos Moments
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Inscrivez-vous à nos événements exclusifs et partagez
              <br />
              vos photos et vidéos avec tous les participants.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <a href="#evenements" className="btn-primary w-full sm:w-auto text-center">
              Voir les événements
            </a>
            <Link href="/inscription" className="btn-secondary w-full sm:w-auto text-center">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="w-px h-16 bg-gradient-to-b from-black to-transparent"></div>
      </div>
    </section>
  )
}
