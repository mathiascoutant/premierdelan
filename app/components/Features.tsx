'use client'

export default function Features() {
  const features = [
    {
      number: '01',
      title: 'Inscription Facile',
      description: 'Parcourez nos événements et inscrivez-vous en quelques clics.',
    },
    {
      number: '02',
      title: 'Galerie Partagée',
      description: 'Uploadez et consultez les photos et vidéos de tous les participants.',
    },
    {
      number: '03',
      title: 'Accès Privé',
      description: 'Chaque événement dispose de sa propre galerie privée et sécurisée.',
    },
    {
      number: '04',
      title: 'Souvenirs Éternels',
      description: 'Conservez et revivez les meilleurs moments de chaque soirée.',
    },
  ]

  return (
    <section id="services" className="py-32 bg-white">
      <div className="section-container">
        {/* Section Header */}
        <div className="max-w-3xl mb-24">
          <p className="text-sm tracking-widest uppercase text-gray-500 mb-4">
            Comment ça marche
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-black">
            Une expérience
            <br />
            <span className="font-normal">interactive</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="flex items-start space-x-6">
                <span className="text-sm font-light text-gray-400 pt-1">
                  {feature.number}
                </span>
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-normal text-black">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
