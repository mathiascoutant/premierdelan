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
  FiMessageCircle,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useFirebaseNotifications } from "../hooks/useFirebaseNotifications";

export default function ClassicHeader() {
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm"
            : "bg-white/90 backdrop-blur-md"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-light">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-light text-black group-hover:text-gray-600 transition-colors tracking-wide">
                  Premier de l'An
                </span>
                <span className="text-xs text-gray-500 -mt-1 font-light">
                  Édition 2026
                </span>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-10">
              <a
                href="#accueil"
                className="text-gray-600 hover:text-black transition-colors font-light text-lg"
              >
                Accueil
              </a>
              <a
                href="#evenements"
                className="text-gray-600 hover:text-black transition-colors font-light text-lg"
              >
                Événements
              </a>
              <a
                href="#services"
                className="text-gray-600 hover:text-black transition-colors font-light text-lg"
              >
                Services
              </a>
              {user && (
                <Link
                  href="/mes-evenements"
                  className="text-gray-600 hover:text-black transition-colors font-light text-lg"
                >
                  Mes événements
                </Link>
              )}
            </nav>

            {/* Actions Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {!isLoading &&
                (user ? (
                  <div className="flex items-center space-x-4">
                    {/* Admin Badge */}
                    {isUserAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <FiShield className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-600">
                          ADMIN
                        </span>
                      </Link>
                    )}

                    {/* Chat Button */}
                    {isUserAdmin && (
                      <Link
                        href="/chat"
                        className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                      >
                        <FiMessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">
                          CHAT
                        </span>
                      </Link>
                    )}

                    {/* User Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {user.firstname?.charAt(0)}
                          {user.lastname?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.firstname}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
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
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-4 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstname} {user.lastname}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {user.email}
                            </p>
                          </div>
                          <div className="py-2">
                            <Link
                              href="/mes-evenements"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FiCalendar className="w-4 h-4" />
                              <span>Mes événements</span>
                            </Link>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                logout();
                              }}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
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
                      className="text-gray-600 hover:text-black transition-colors font-light text-lg"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/inscription"
                      className="bg-black text-white px-8 py-3 rounded-lg font-light text-lg hover:bg-gray-800 transition-all duration-300 tracking-wide"
                    >
                      S'inscrire
                    </Link>
                  </div>
                ))}
            </div>

            {/* Mobile Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-black transition-colors p-2"
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Menu Content */}
          <div className="relative h-full flex flex-col bg-white w-80 ml-auto">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
                <span className="text-lg font-semibold text-black">Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-black transition-colors p-2"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* User Card */}
            {user && (
              <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-medium">
                    {user.firstname?.charAt(0)}
                    {user.lastname?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                    {isUserAdmin && (
                      <span className="inline-flex items-center space-x-1 mt-2 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        <FiShield className="w-3 h-3" />
                        <span>Administrateur</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <nav className="space-y-2">
                <a
                  href="#accueil"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Accueil
                </a>
                <a
                  href="#evenements"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Événements
                </a>
                <a
                  href="#services"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Services
                </a>
                {user && (
                  <>
                    <Link
                      href="/mes-evenements"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    >
                      <FiCalendar className="w-5 h-5" />
                      <span>Mes événements</span>
                    </Link>
                    {isUserAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                      >
                        <FiShield className="w-5 h-5" />
                        <span>Administration</span>
                      </Link>
                    )}
                    {isUserAdmin && (
                      <Link
                        href="/chat"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                      >
                        <FiMessageCircle className="w-5 h-5" />
                        <span>Chat</span>
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {/* Notifications */}
              {user && (
                <div className="mt-6 pt-6 border-t border-gray-100">
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
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
              <div className="border-t border-gray-200 px-6 py-6 space-y-3">
                {user ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center space-x-3 w-full px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg font-medium"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                ) : (
                  <>
                    <Link
                      href="/inscription"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors text-center font-medium rounded-lg"
                    >
                      S'inscrire
                    </Link>
                    <Link
                      href="/connexion"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-center font-medium rounded-lg"
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
