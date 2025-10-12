import type { Metadata } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";

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
  manifest: "/premierdelan/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${crimsonText.variable}`}>
      <body className={crimsonText.className}>{children}</body>
    </html>
  );
}
