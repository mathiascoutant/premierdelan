'use client'

export default function EventsPreview() {
  const events = [
    {
      title: 'Réveillon 2026',
      subtitle: '31 Décembre 2025',
      description: 'Célébrez la nouvelle année et partagez vos meilleurs moments.',
      capacity: '50-100 personnes',
      status: 'Places disponibles',
      gallery: '0 photos'
    },
    {
      title: 'Summer Vibes',
      subtitle: '15 Juillet 2025',
      description: 'Soirée d\'été exclusive avec piscine et DJ.',
      capacity: '80 personnes',
      status: 'Bientôt complet',
      gallery: '0 photos'
    },
    {
      title: 'White Party',
      subtitle: '20 Juin 2025',
      description: 'Soirée élégante sur le thème blanc.',
      capacity: '120 personnes',
      status: 'Ouvert',
      gallery: '247 photos'
    },
  ]

  return (
    <section id="evenements" className="py-32 bg-gray-50">
      <div className="section-container">
        {/* Section Header */}
        <div className="max-w-3xl mb-24">
          <p className="text-sm tracking-widest uppercase text-gray-500 mb-4">
            Événements à venir
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-black">
            Rejoignez-nous
            <br />
            <span className="font-normal">et partagez</span>
          </h2>
        </div>

        {/* Events List */}
        <div className="space-y-px bg-black">
          {events.map((event, index) => (
              <div
              key={index}
              className="group bg-white hover:bg-gray-50 transition-colors duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-12 px-8 md:px-12 space-y-6 lg:space-y-0">
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-3xl md:text-4xl font-normal text-black">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">
                      {event.subtitle}
                    </p>
                  </div>
                  <p className="text-gray-600 font-light max-w-md">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap gap-6 text-sm text-gray-500 pt-2">
                    <span>{event.capacity}</span>
                    <span className="border-l border-gray-300 pl-6">{event.status}</span>
                    <span className="border-l border-gray-300 pl-6">{event.gallery}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                  <button className="btn-primary whitespace-nowrap">
                    S'inscrire
                  </button>
                  <button className="btn-secondary whitespace-nowrap">
                    Voir la galerie
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
