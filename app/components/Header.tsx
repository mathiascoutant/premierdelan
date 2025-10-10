"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiBell } from "react-icons/fi";
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-6 pt-2">
            <div className="flex flex-col space-y-6">
              {/* Profil utilisateur en haut du menu mobile */}
              {user && (
                <div className="pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-medium">
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
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstname} {user.lastname}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profil"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm text-gray-700 hover:text-black transition-colors mb-2"
                  >
                    Mon profil
                  </Link>

                  {/* Notifications sur mobile */}
                  <div className="py-2 space-y-2">
                    <NotificationButton
                      userEmail={user.email}
                      className="mb-2"
                    />

                    <button
                      onClick={handleTestNotification}
                      disabled={isTestingNotification}
                      className="flex items-center w-full text-sm text-gray-700 hover:text-black transition-colors disabled:opacity-50"
                    >
                      <FiBell
                        className={`w-4 h-4 mr-2 ${
                          isTestingNotification ? "animate-pulse" : ""
                        }`}
                      />
                      {isTestingNotification
                        ? "Envoi..."
                        : "Tester notification"}
                    </button>

                    {notificationMessage && (
                      <div
                        className={`px-3 py-2 rounded text-xs ${
                          notificationMessage.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {notificationMessage.text}
                      </div>
                    )}
                  </div>

                  <Link
                    href="/mes-evenements"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm text-gray-700 hover:text-black transition-colors"
                  >
                    Mes événements
                  </Link>

                  {/* Lien Admin si user est admin (mobile) */}
                  {isUserAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-sm font-medium text-black hover:text-gray-600 transition-colors pt-2 border-t border-gray-100 mt-2"
                    >
                      🔑 Espace Admin
                    </Link>
                  )}
                </div>
              )}

              {menuItems
                .filter((item) => !user || item.label !== "Connexion")
                .map((item) =>
                  item.isHash ? (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors uppercase"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors uppercase"
                    >
                      {item.label}
                    </Link>
                  )
                )}

              {!isLoading && (
                <>
                  {user ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="btn-secondary w-full text-center text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      Déconnexion
                    </button>
                  ) : (
                    <Link
                      href="/inscription"
                      className="btn-primary w-full block text-center"
                    >
                      S&apos;inscrire
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
