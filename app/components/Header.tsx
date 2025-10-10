"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiBell, FiCalendar } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import UserMenu from "./UserMenu";
import NotificationButton from "./NotificationButton";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Accueil", href: "#accueil", isHash: true },
    { label: "Événements", href: "#evenements", isHash: true },
    { label: "Comment ça marche", href: "#services", isHash: true },
    { label: "Connexion", href: "/connexion", isHash: false },
  ];

  const isUserAdmin = user?.admin === 1;

  // Fonction pour tester les notifications (mobile)
  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    setNotificationMessage(null);

    try {
      const token = localStorage.getItem("auth_token");

      await apiRequest(API_ENDPOINTS.fcmSend, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user?.email,
          title: "🎉 Premier de l'An",
          message: `Bonjour ${user?.firstname} ! Test de notification réussi.`,
          data: {
            action: "test",
            url: "/mes-evenements",
          },
        }),
      });

      setNotificationMessage({
        type: "success",
        text: "Notification envoyée !",
      });

      setTimeout(() => {
        setNotificationMessage(null);
      }, 3000);
    } catch (error: any) {
      setNotificationMessage({
        type: "error",
        text: error.message || "Erreur lors de l'envoi",
      });

      setTimeout(() => {
        setNotificationMessage(null);
      }, 3000);
    } finally {
      setIsTestingNotification(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white border-b border-gray-200" : "bg-white"
      }`}
    >
      <nav className="section-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="group">
            <span className="text-xl font-medium tracking-tight text-black">
              PREMIER DE L&apos;AN
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            {menuItems
              .filter((item) => !user || item.label !== "Connexion")
              .map((item) =>
                item.isHash ? (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors duration-200 uppercase"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors duration-200 uppercase"
                  >
                    {item.label}
                  </Link>
                )
              )}

            {/* Lien Admin si user est admin */}
            {isUserAdmin && (
              <Link
                href="/admin"
                className="text-sm tracking-wide text-black font-medium hover:text-gray-600 transition-colors duration-200 uppercase border-b-2 border-black"
              >
                Admin
              </Link>
            )}

            {!isLoading && (
              <>
                {user ? (
                  <UserMenu user={user} onLogout={logout} />
                ) : (
                  <Link href="/inscription" className="btn-primary">
                    S&apos;inscrire
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-black"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Menu Panel */}
            <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
              {/* Header du menu */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <span className="font-medium text-gray-900">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Profil utilisateur */}
                {user && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white font-medium shadow-lg">
                        {user.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.photo}
                            alt={user.firstname}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          `${user.firstname?.charAt(0) || ""}${
                            user.lastname?.charAt(0) || ""
                          }`.toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation principale */}
                {user && (
                  <div className="space-y-2">
                    <Link
                      href="/profil"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-lg flex items-center justify-center transition-colors">
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">
                        Mon profil
                      </span>
                    </Link>

                    <Link
                      href="/mes-evenements"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-lg flex items-center justify-center transition-colors">
                        <FiCalendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        Mes événements
                      </span>
                    </Link>

                    {/* Lien Admin si user est admin */}
                    {isUserAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">Espace Admin</span>
                      </Link>
                    )}
                  </div>
                )}

                {/* Notifications */}
                {user && (
                  <div className="space-y-3 pb-6 border-b border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
                      Notifications
                    </p>
                    <NotificationButton
                      userEmail={user.email}
                      className="w-full"
                    />

                    <button
                      onClick={handleTestNotification}
                      disabled={isTestingNotification}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 w-full group"
                    >
                      <div className="w-10 h-10 bg-gray-100 group-hover:bg-white rounded-lg flex items-center justify-center transition-colors">
                        <FiBell
                          className={`w-5 h-5 text-gray-600 ${
                            isTestingNotification ? "animate-pulse" : ""
                          }`}
                        />
                      </div>
                      <span className="font-medium text-gray-900">
                        {isTestingNotification
                          ? "Envoi..."
                          : "Tester notification"}
                      </span>
                    </button>

                    {notificationMessage && (
                      <div
                        className={`mx-2 px-4 py-3 rounded-lg text-sm ${
                          notificationMessage.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {notificationMessage.text}
                      </div>
                    )}
                  </div>
                )}

                {/* Liens de navigation */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-3">
                    Navigation
                  </p>
                  {menuItems
                    .filter((item) => !user || item.label !== "Connexion")
                    .map((item) =>
                      item.isHash ? (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                </div>

                {/* Bouton d'action */}
                {!isLoading && (
                  <div className="pt-4">
                    {user ? (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center justify-center space-x-3 w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Déconnexion</span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          href="/inscription"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-center"
                        >
                          S&apos;inscrire
                        </Link>
                        <Link
                          href="/connexion"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                        >
                          Se connecter
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
