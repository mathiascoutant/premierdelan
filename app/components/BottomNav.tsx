"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import {
  FiHome,
  FiCalendar,
  FiImage,
  FiMessageCircle,
  FiUser,
} from "react-icons/fi";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isUserAdmin = user?.admin === 1;

  const navItems = [
    { href: "/", icon: FiHome, label: "Accueil" },
    { href: "/evenements", icon: FiCalendar, label: "Événements" },
    { href: "/galerie", icon: FiImage, label: "Galerie" },
    ...(isUserAdmin
      ? [{ href: "/chat", icon: FiMessageCircle, label: "Messages" }]
      : []),
    { href: user ? "/profil" : "/connexion", icon: FiUser, label: "Profil" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-2xl border-t border-white/10 z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative h-full"
            >
              <div
                className={`p-2 rounded-2xl transition-all ${
                  isActive ? "bg-[#d4af37]/20" : ""
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition-all ${
                    isActive ? "text-[#d4af37]" : "text-gray-600"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-[#d4af37]" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-10 h-1 bg-[#d4af37] rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
