import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Stats from '../components/landing/Stats';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Stats />
      <Footer />
    </div>
  );
};

export default LandingPage;
