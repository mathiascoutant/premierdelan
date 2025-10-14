"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiUsers,
  FiStar,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiMapPin,
} from "react-icons/fi";

export default function ClassicHomePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2025-12-31T23:59:59").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-white text-black py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">P</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-tight">
              Nouvel An 2026
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
              Une célébration d'exception pour marquer le début d'une nouvelle
              année
            </p>

            {/* Countdown */}
            <div className="grid grid-cols-4 gap-8 max-w-2xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-light text-black mb-2">
                  {timeLeft.days}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  Jours
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-light text-black mb-2">
                  {timeLeft.hours}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  Heures
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-light text-black mb-2">
                  {timeLeft.minutes}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  Minutes
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-light text-black mb-2">
                  {timeLeft.seconds}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  Secondes
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/inscription"
                className="bg-black text-white px-12 py-4 text-lg font-medium hover:bg-gray-800 transition-all duration-300 inline-flex items-center justify-center tracking-wide"
              >
                Réserver ma place
                <FiArrowRight className="ml-3 w-5 h-5" />
              </Link>
              <Link
                href="#details"
                className="border border-gray-300 text-gray-700 px-12 py-4 text-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section id="details" className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Une soirée inoubliable
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Rejoignez-nous pour une célébration exceptionnelle dans un cadre
              prestigieux
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
                <FiCalendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                31 Décembre 2025
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Célébration du passage à la nouvelle année
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
                <FiMapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                Lieu prestigieux
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Cadre exceptionnel pour une soirée mémorable
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
                <FiUsers className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                100 invités
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Soirée privée et exclusive
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-gray-600 font-light leading-relaxed">
              Une expérience premium pour votre célébration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-4">
                Service Premium
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Accueil et service d'exception
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiStar className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-4">
                Qualité Garantie
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Standards élevés pour votre satisfaction
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiClock className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-4">
                Ponctualité
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Respect des horaires et planning
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUsers className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-4">
                Équipe Dédiée
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Personnel qualifié à votre service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight">
            Prêt à célébrer avec nous ?
          </h2>
          <p className="text-xl text-gray-300 mb-12 font-light leading-relaxed">
            Rejoignez-nous pour une soirée exceptionnelle qui marquera le début
            de votre nouvelle année
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/inscription"
              className="bg-white text-black px-12 py-4 text-lg font-medium hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center tracking-wide"
            >
              Réserver maintenant
              <FiArrowRight className="ml-3 w-5 h-5" />
            </Link>
            <Link
              href="/connexion"
              className="border border-gray-400 text-white px-12 py-4 text-lg font-medium hover:bg-white hover:text-black transition-all duration-300"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
