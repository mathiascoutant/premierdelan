"use client";

import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const isUserAdmin = user?.admin === 1;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/connexion");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-20">
      {/* Fond médiéval luxueux */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 -z-10"></div>
      <div
        className="fixed inset-0 opacity-40 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212,175,55,0.2) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="fixed top-20 right-10 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-[#c9a74f]/10 rounded-full blur-[120px] -z-10"></div>

      {/* Header fixe */}
      <div className="sticky top-0 z-50 bg-zinc-900/85 backdrop-blur-3xl border-b border-[#d4af37]/25 shadow-xl">
        <div className="px-6 py-4 flex items-center justify-between max-w-screen-xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#d4af37] hover:text-[#f4d03f] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-cinzel font-bold text-sm tracking-wider">
              RETOUR
            </span>
          </button>
          <h1 className="font-cinzel font-bold text-[#d4af37] text-base tracking-[0.2em]">
            MON PROFIL
          </h1>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Carte profil principale */}
        <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 backdrop-blur-xl border border-[#d4af37]/25 rounded-3xl overflow-hidden shadow-2xl mb-6">
          <div className="relative px-6 pt-10 pb-8 text-center">
            {/* Avatar luxueux */}
            <div className="w-28 h-28 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] flex items-center justify-center text-black text-4xl font-black shadow-2xl shadow-[#d4af37]/30">
              {user.firstname.charAt(0)}
              {user.lastname.charAt(0)}
            </div>

            {/* Nom */}
            <h2 className="text-3xl font-cinzel font-bold text-white mb-2">
              {user.firstname} {user.lastname}
            </h2>

            {/* Badge admin */}
            {isUserAdmin && (
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full backdrop-blur-sm mb-4">
                <span className="text-[#d4af37] text-lg">⚜</span>
                <span className="text-xs font-cinzel font-bold text-[#d4af37] tracking-wider">
                  ADMINISTRATEUR
                </span>
                <span className="text-[#d4af37] text-lg">⚜</span>
              </div>
            )}

            {/* Email */}
            <p className="text-sm text-gray-400 font-crimson">{user.email}</p>
          </div>

          {/* Divider doré */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>

          {/* Informations détaillées */}
          <div className="p-6 space-y-4">
            {/* Email */}
            <div className="flex items-center gap-4 p-4 bg-zinc-800/40 rounded-2xl border border-[#d4af37]/10">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✉️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#d4af37] font-cinzel tracking-wider uppercase mb-1 font-bold">
                  Email
                </p>
                <p className="text-sm text-white font-crimson truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Téléphone */}
            {user.phone && (
              <div className="flex items-center gap-4 p-4 bg-zinc-800/40 rounded-2xl border border-[#d4af37]/10">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#d4af37] font-cinzel tracking-wider uppercase mb-1 font-bold">
                    Téléphone
                  </p>
                  <p className="text-sm text-white font-crimson">
                    {user.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Code soirée */}
            {user.code_soiree && (
              <div className="flex items-center gap-4 p-4 bg-zinc-800/40 rounded-2xl border border-[#d4af37]/10">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎫</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#d4af37] font-cinzel tracking-wider uppercase mb-1 font-bold">
                    Code Soirée
                  </p>
                  <p className="text-sm text-white font-mono font-bold tracking-widest">
                    {user.code_soiree}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => router.push("/evenements")}
            className="w-full bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 backdrop-blur-xl border border-[#d4af37]/25 rounded-2xl p-5 flex items-center justify-between hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
                <span className="text-2xl">🎭</span>
              </div>
              <div className="text-left">
                <p className="text-white font-cinzel font-bold text-base mb-1">
                  Mes Événements
                </p>
                <p className="text-xs text-gray-400 font-crimson">
                  Voir mes réservations
                </p>
              </div>
            </div>
            <svg
              className="w-6 h-6 text-[#d4af37]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {isUserAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className="w-full bg-gradient-to-br from-[#d4af37]/10 to-[#c9a74f]/10 backdrop-blur-xl border border-[#d4af37]/40 rounded-2xl p-5 flex items-center justify-between hover:border-[#d4af37]/60 hover:shadow-xl hover:shadow-[#d4af37]/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center">
                  <span className="text-2xl">⚜</span>
                </div>
                <div className="text-left">
                  <p className="text-[#d4af37] font-cinzel font-bold text-base mb-1">
                    Administration
                  </p>
                  <p className="text-xs text-[#d4af37]/70 font-crimson">
                    Gérer le site
                  </p>
                </div>
              </div>
              <svg
                className="w-6 h-6 text-[#d4af37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Bouton déconnexion */}
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-full bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-5 flex items-center justify-center gap-3 text-red-400 font-cinzel font-bold hover:border-red-500/50 hover:bg-red-500/20 transition-all"
        >
          <span className="text-xl">🚪</span>
          <span className="tracking-wider">DÉCONNEXION</span>
        </button>
      </div>
    </div>
  );
}
