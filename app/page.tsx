"use client";

import { useTheme } from "./hooks/useTheme";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ThemeIntro from "./components/ThemeIntro";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import EventsPreview from "./components/EventsPreview";
import Footer from "./components/Footer";
import MobileHomePage from "./components/MobileHomePage";
import ClassicHomePage from "./components/ClassicHomePage";
import ClassicHeader from "./components/ClassicHeader";
import ClassicFooter from "./components/ClassicFooter";

export default function Home() {
  const { isClassic } = useTheme();

  if (isClassic) {
    return (
      <main className="min-h-screen overflow-x-hidden">
        <ClassicHeader />
        <ClassicHomePage />
        <ClassicFooter />
      </main>
    );
  }

  return (
    <>
      {/* Version Mobile App-like */}
      <div className="md:hidden">
        <MobileHomePage />
      </div>

      {/* Version Desktop classique */}
      <main className="hidden md:block min-h-screen overflow-x-hidden">
        <Header />
        <Hero />
        <ThemeIntro />
        <EventsPreview />
        <HowItWorks />
        <Features />
        <Footer />
      </main>
    </>
  );
}
