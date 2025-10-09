'use client'

export default function CallToAction() {
  return (
    <section id="contact" className="py-32 bg-white">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          <div className="text-center mb-16">
            <p className="text-sm tracking-widest uppercase text-gray-500 mb-6">
              Restez Informé
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-black mb-6">
              Ne ratez aucun
              <br />
              <span className="font-normal">événement</span>
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Créez votre compte gratuitement et recevez les invitations en avant-première.
            </p>
          </div>

          {/* Signup Form */}
          <div className="max-w-md mx-auto">
            <form className="space-y-6">
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                  Nom complet
                </label>
                <input
                  type="text"
                  className="w-full px-0 py-3 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-black"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-0 py-3 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-black"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-500 mb-3">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-0 py-3 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-black"
                />
              </div>
              <div className="pt-6">
                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Créer mon compte
                </button>
              </div>
              <p className="text-sm text-gray-500 text-center pt-4">
                Déjà inscrit ?{' '}
                <a href="#" className="text-black hover:underline">
                  Se connecter
                </a>
              </p>
            </form>
          </div>

          {/* Benefits */}
          <div className="mt-20 pt-16 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                <p className="text-xs tracking-wider uppercase text-gray-500 mb-3">
                  Gratuit
                </p>
                <p className="text-black">
                  Inscription et galeries incluses
                </p>
              </div>
              <div>
                <p className="text-xs tracking-wider uppercase text-gray-500 mb-3">
                  Sécurisé
                </p>
                <p className="text-black">
                  Galeries privées et protégées
                </p>
              </div>
              <div>
                <p className="text-xs tracking-wider uppercase text-gray-500 mb-3">
                  Illimité
                </p>
                <p className="text-black">
                  Uploads de photos et vidéos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
