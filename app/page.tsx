import Header from "./components/Header";
import Hero from "./components/Hero";
import ThemeIntro from "./components/ThemeIntro";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import EventsPreview from "./components/EventsPreview";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
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
