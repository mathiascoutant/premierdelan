'use client'

export default function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Parcourez',
      description: 'Découvrez nos événements à venir',
    },
    {
      step: '2',
      title: 'Inscrivez-vous',
      description: 'Réservez votre place en ligne',
    },
    {
      step: '3',
      title: 'Participez',
      description: 'Profitez de la soirée',
    },
    {
      step: '4',
      title: 'Partagez',
      description: 'Uploadez vos photos et vidéos',
    },
    {
      step: '5',
      title: 'Revivez',
      description: 'Accédez à toutes les galeries',
    },
  ]

  return (
    <section className="py-32 bg-white">
      <div className="section-container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <p className="text-sm tracking-widest uppercase text-gray-500 mb-4">
              Processus Simple
            </p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-black">
              En <span className="font-normal">5 étapes</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gray-200"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-6 relative">
              {steps.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-black text-white flex items-center justify-center text-xl font-light relative">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-medium text-black mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-light">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

