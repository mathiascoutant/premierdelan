import type { Metadata, Viewport } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";
import PWASplashScreen from "./components/PWASplashScreen";
import NotificationRedirectHandler from "./components/NotificationRedirectHandler";
import AppBadgeManager from "./components/AppBadgeManager";
import { ThemeProvider } from "./hooks/useTheme";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "600", "700"],
});

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Premier de l'An - Événements Privés",
  description: "Organisation d'événements privés d'excellence",
  keywords: ["événements privés", "soirées", "organisation", "luxe"],
  manifest:
    process.env.NODE_ENV === "production"
      ? "/premierdelan/manifest.json"
      : "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${crimsonText.variable}`}>
      <body className={crimsonText.className}>
        <ThemeProvider>
          <PWASplashScreen />
          <NotificationRedirectHandler />
          <AppBadgeManager />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
