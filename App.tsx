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
  { name: "Sou Felina | Moda Íntima", image: "https://i.imgur.com/3Z7VqfD.png", link: "https://sou-felina.vercel.app/" },
  { name: "Landing Page Studio X", image: "https://picsum.photos/seed/studiox/400/800", link: "#" },
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
      <SparklesBackground count={100} className="fixed inset-0 z-0" />
      
      <Header isAdmin={isAdmin} onAdminClick={handleAdminAction} onLogout={handleLogout} />
      
      <main className="relative z-10">
        <HeroSection />
        <BenefitsSection />
        <PortfolioSection projects={projects} />
        <AboutSection />
        <ServicesSection />
        <TeamSection />
        <ContactSection />
      </main>
      
      <Footer isAdmin={isAdmin} onAdminLoginClick={handleAdminAction} />

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
