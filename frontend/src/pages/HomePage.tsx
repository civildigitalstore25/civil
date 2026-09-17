import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import SoftwareCollection from '../components/home/SoftwareCollection';
import BestSellersSection from '../components/home/BestSellersSection';
import NewArrivalsSection from '../components/home/NewArrivalsSection';
import HomeProductShowcase from '../components/home/HomeProductShowcase';
import HomeReviewsSection from '../components/home/HomeReviewsSection';
import WhatsAppButton from '../components/common/WhatsAppButton';
import AuthSuccessBanner from '../components/common/AuthSuccessBanner';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      <AuthSuccessBanner />
      {/* Fixed Sticky Top Header */}
      <header className="sticky top-0 z-50 w-full shadow-md">
        {/* Top Announcement Bar */}
        <AnnouncementBar />

        {/* Main White Header */}
        <Header />

        {/* Navigation Bar */}
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* 1. Hero Banner */}
        <HeroSection />

        {/* 2. All Category Icons Grid */}
        <SoftwareCollection />

        {/* 3. Best Sellers */}
        <BestSellersSection />

        {/* 4. Newly Arrived */}
        <NewArrivalsSection />

        {/* 5. Interactive Filterable Product Showcase (All Products, Best Sellers, Newly Arrived, AutoCAD, Revit, Excel Sheets, etc.) */}
        <HomeProductShowcase />

        {/* 6. Verified Customer Reviews */}
        <HomeReviewsSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default HomePage;
