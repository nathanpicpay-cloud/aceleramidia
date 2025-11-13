
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import BenefitsSection from './components/BenefitsSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import PortfolioSection from './components/PortfolioSection';
import TeamSection from './components/TeamSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import SparklesBackground from './components/SparklesBackground';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';

// Default project data if nothing is in localStorage
const initialProjects = [
  { name: "Sou Felina | Moda Íntima", image: "https://images.weserv.nl/?url=i.imgur.com/IvM4D3x.png", link: "https://sou-felina.vercel.app/" },
  { name: "Hee In Fragrâncias", image: "https://images.weserv.nl/?url=i.imgur.com/uLUrQab.png", link: "https://heeinfragrancias.vercel.app/" },
  { name: "Sistema de Reservas Hotelaria", image: "https://picsum.photos/seed/hotel/400/800", link: "#" },
  { name: "E-commerce de Moda", image: "https://picsum.photos/seed/fashion/400/800", link: "#" },
  { name: "App de Viagens", image: "https://picsum.photos/seed/travel/400/800", link: "#" },
];

const PROJECTS_STORAGE_KEY = 'aceleraMidiaProjects';

const App: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(initialProjects));
        setProjects(initialProjects);
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage:", error);
      setProjects(initialProjects);
    }

    // Check session storage for admin status
    if (sessionStorage.getItem('isAdmin') === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleLoginAttempt = (password: string) => {
    if (password === '777') {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      setIsLoginModalOpen(false);
      setIsAdminPanelOpen(true); // Open panel right after login
      alert('Login successful!');
    } else {
      alert('Incorrect password.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    setIsAdminPanelOpen(false);
  }

  const handleProjectsChange = (updatedProjects: any[]) => {
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
  };
  
  const handleAdminAction = () => {
    if (isAdmin) {
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="bg-black text-white overflow-x-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-[#FF007F] rounded-full blur-[200px] opacity-10"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-600 rounded-full blur-[200px] opacity-10"></div>
      </div>
      <SparklesBackground className="fixed inset-0 z-0" />
      
      <Header isAdmin={isAdmin} onAdminClick={handleAdminAction} onLogout={handleLogout} />
      
      <main className="relative z-10">
        <HeroSection />
        <BenefitsSection />
        <PortfolioSection projects={projects} />
        <AboutSection />
        <ServicesSection />
        <TeamSection />
        <ContactSection isAdmin={isAdmin} onAdminClick={handleAdminAction} />
      </main>
      
      <Footer />

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSubmit={handleLoginAttempt}
        />
      )}
      
      {isAdmin && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          projects={projects}
          onProjectsChange={handleProjectsChange}
        />
      )}
    </div>
  );
};

export default App;
