"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiCalendar,
  FiShield,
  FiBell,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useFirebaseNotifications } from "../hooks/useFirebaseNotifications";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const {
    activerNotifications,
    isActivating,
    checkPermission,
    checkIfEnabled,
  } = useFirebaseNotifications();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isUserAdmin = user?.admin === 1;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-ink/95 backdrop-blur-lg border-b border-gold/20 shadow-lg"
            : "bg-gradient-to-b from-ink/80 via-ink/60 to-transparent backdrop-blur-md"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo avec ornement */}
            <Link
              href="/"
              className="group relative flex items-center space-x-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative text-gold text-2xl">⚜</span>
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel text-base md:text-lg tracking-[0.35em] text-gold group-hover:text-gold-light transition-all duration-300 leading-none">
                  PREMIER DE L&apos;AN
                </span>
                <span className="font-crimson text-[10px] tracking-widest text-stone-light opacity-70 mt-0.5">
                  Édition 2026
                </span>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-10">
              <a href="#accueil" className="relative group py-2">
                <span className="text-sm font-crimson text-parchment/70 group-hover:text-gold transition-colors duration-300">
                  Accueil
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#evenements" className="relative group py-2">
                <span className="text-sm font-crimson text-parchment/70 group-hover:text-gold transition-colors duration-300">
                  Événements
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#services" className="relative group py-2">
                <span className="text-sm font-crimson text-parchment/70 group-hover:text-gold transition-colors duration-300">
                  Services
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300"></span>
              </a>
              {user && (
                <Link href="/mes-evenements" className="relative group py-2">
                  <span className="text-sm font-crimson text-parchment/70 group-hover:text-gold transition-colors duration-300">
                    Mes événements
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
            </nav>

            {/* Actions Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              {!isLoading &&
                (user ? (
                  <div className="flex items-center space-x-4">
                    {/* Admin Badge */}
                    {isUserAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-4 py-2 bg-burgundy/20 border border-burgundy-light/30 hover:bg-burgundy/30 transition-all duration-300 group"
                      >
                        <FiShield className="w-4 h-4 text-burgundy-light group-hover:text-gold transition-colors" />
                        <span className="text-xs font-cinzel tracking-wider text-burgundy-light group-hover:text-gold transition-colors">
                          ADMIN
                        </span>
                      </Link>
                    )}

                    {/* User Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 px-4 py-2 border border-gold/30 hover:border-gold/60 hover:bg-gold/5 transition-all duration-300 group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-gold via-gold-dark to-brown flex items-center justify-center text-ink text-xs font-bold shadow-md group-hover:shadow-lg transition-all">
                          {user.firstname?.charAt(0)}
                          {user.lastname?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-parchment group-hover:text-gold transition-colors">
                          {user.firstname}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gold transition-transform duration-300 ${
                            showUserMenu ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-ink/98 backdrop-blur-xl border border-gold/20 shadow-2xl overflow-hidden animate-fade-in">
                          <div className="p-4 border-b border-gold/10">
                            <p className="text-sm font-medium text-parchment">
                              {user.firstname} {user.lastname}
                            </p>
                            <p className="text-xs text-stone-light mt-1">
                              {user.email}
                            </p>
                          </div>
                          <div className="py-2">
                            <Link
                              href="/mes-evenements"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-parchment/70 hover:text-gold hover:bg-gold/5 transition-all"
                            >
                              <FiCalendar className="w-4 h-4" />
                              <span>Mes événements</span>
                            </Link>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                logout();
                              }}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-burgundy-light hover:text-gold hover:bg-gold/5 transition-all w-full text-left"
                            >
                              <FiLogOut className="w-4 h-4" />
                              <span>Déconnexion</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/connexion"
                      className="text-sm font-crimson text-parchment/70 hover:text-gold transition-colors duration-300"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/inscription"
                      className="relative px-6 py-2.5 bg-gold text-ink text-sm font-cinzel tracking-wider hover:bg-gold-dark transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden group"
                    >
                      <span className="relative z-10">S&apos;INSCRIRE</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-gold-dark to-brown opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </div>
                ))}
            </div>

            {/* Mobile Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gold hover:text-gold-light transition-colors p-2"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-ink/95 backdrop-blur-2xl"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Menu Content */}
          <div className="relative h-full flex flex-col bg-gradient-to-b from-ink via-ink-light/20 to-ink">
            {/* Header */}
            <div className="border-b border-gold/20 px-6 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gold text-xl">⚜</span>
                <span className="font-cinzel text-base tracking-[0.3em] text-gold">
                  MENU
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gold hover:text-gold-light transition-colors p-2"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* User Card */}
            {user && (
              <div className="px-6 py-8 border-b border-gold/10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gold via-gold-dark to-brown flex items-center justify-center text-ink font-bold text-lg shadow-lg">
                    {user.firstname?.charAt(0)}
                    {user.lastname?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-cinzel text-parchment">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="text-sm text-stone-light mt-1">
                      {user.email}
                    </p>
                    {isUserAdmin && (
                      <span className="inline-flex items-center space-x-1 mt-2 px-2 py-1 bg-burgundy/20 border border-burgundy-light/30 text-xs text-burgundy-light">
                        <FiShield className="w-3 h-3" />
                        <span>Administrateur</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <nav className="space-y-2">
                <a
                  href="#accueil"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-4 text-lg font-crimson text-parchment/70 hover:text-gold hover:bg-gold/5 transition-all border-l-2 border-transparent hover:border-gold"
                >
                  Accueil
                </a>
                <a
                  href="#evenements"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-4 text-lg font-crimson text-parchment/70 hover:text-gold hover:bg-gold/5 transition-all border-l-2 border-transparent hover:border-gold"
                >
                  Événements
                </a>
                <a
                  href="#services"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-4 text-lg font-crimson text-parchment/70 hover:text-gold hover:bg-gold/5 transition-all border-l-2 border-transparent hover:border-gold"
                >
                  Services
                </a>
                {user && (
                  <>
                    <Link
                      href="/mes-evenements"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-4 text-lg font-crimson text-parchment/70 hover:text-gold hover:bg-gold/5 transition-all border-l-2 border-transparent hover:border-gold"
                    >
                      <FiCalendar className="w-5 h-5" />
                      <span>Mes événements</span>
                    </Link>
                    {isUserAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-4 text-lg font-crimson text-burgundy-light hover:text-gold hover:bg-gold/5 transition-all border-l-2 border-transparent hover:border-gold"
                      >
                        <FiShield className="w-5 h-5" />
                        <span>Administration</span>
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {/* Notifications (si utilisateur connecté) */}
              {user && (
                <div className="mt-6 pt-6 border-t border-gold/10">
                  <button
                    onClick={() => {
                      if (user.email) {
                        activerNotifications(user.email);
                      }
                    }}
                    disabled={
                      isActivating ||
                      (checkPermission() === "granted" && checkIfEnabled())
                    }
                    className="flex items-center space-x-3 px-4 py-4 text-lg font-crimson text-parchment/70 hover:text-gold hover:bg-gold/5 transition-all border-l-2 border-transparent hover:border-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiBell
                      className={`w-5 h-5 ${
                        isActivating ? "animate-pulse" : ""
                      } ${
                        checkPermission() === "granted" && checkIfEnabled()
                          ? "text-green-500"
                          : ""
                      }`}
                    />
                    <span>
                      {checkPermission() === "granted" && checkIfEnabled()
                        ? "Notifications activées"
                        : isActivating
                        ? "Activation..."
                        : "Activer les notifications"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {!isLoading && (
              <div className="border-t border-gold/20 px-6 py-6 space-y-3">
                {user ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center space-x-3 w-full px-6 py-4 border-2 border-burgundy-light/30 text-burgundy-light hover:bg-burgundy/20 transition-all"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="font-cinzel tracking-wider">
                      DÉCONNEXION
                    </span>
                  </button>
                ) : (
                  <>
                    <Link
                      href="/inscription"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-6 py-4 bg-gold text-ink hover:bg-gold-dark transition-all text-center font-cinzel tracking-wider shadow-lg"
                    >
                      S&apos;INSCRIRE
                    </Link>
                    <Link
                      href="/connexion"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-6 py-4 border-2 border-gold text-gold hover:bg-gold hover:text-ink transition-all text-center font-crimson"
                    >
                      Connexion
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
