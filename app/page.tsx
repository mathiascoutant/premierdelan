"use client";

import { useTheme } from "./hooks/useTheme";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ThemeIntro from "./components/ThemeIntro";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import EventsPreview from "./components/EventsPreview";
import Footer from "./components/Footer";
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
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <Hero />
      <ThemeIntro />
      <EventsPreview />
      <HowItWorks />
      <Features />
      <Footer />
    </main>
  );
}
