import Header from './components/Header'
import Hero from './components/Hero'
import Footer from './components/Footer'
import EventsPreview from './components/EventsPreview'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import CallToAction from './components/CallToAction'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <EventsPreview />
      <CallToAction />
      <Footer />
    </main>
  )
}

