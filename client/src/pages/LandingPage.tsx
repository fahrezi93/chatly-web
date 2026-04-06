import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import Stats from '../components/landing/Stats';
import Pricing from '../components/landing/Pricing';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
