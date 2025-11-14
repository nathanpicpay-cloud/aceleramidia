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
import * as api from './lib/apiClient';

export interface Project {
  id: number;
  name: string;
  image: string;
  link: string;
  created_at: string;
  updated_at: string;
}

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar status de admin no sessionStorage
    if (sessionStorage.getItem('isAdmin') === 'true') {
      setIsAdmin(true);
    }

    // Buscar projetos da API
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const projectsData = await api.fetchProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      setError("Não foi possível carregar os projetos. Verifique se o servidor está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginAttempt = (password: string) => {
    // IMPORTANTE: Em produção, use autenticação adequada (JWT, OAuth, etc.)
    if (password === '777') { 
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      setIsLoginModalOpen(false);
      setIsAdminPanelOpen(true);
      alert('Login realizado com sucesso!');
    } else {
      alert('Senha incorreta.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    setIsAdminPanelOpen(false);
  };

  const addProject = async (name: string, imageFile: File, link: string) => {
    try {
      const newProject = await api.createProject(name, imageFile, link);
      setProjects(prevProjects => [newProject, ...prevProjects]);
      alert('Projeto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error);
      alert('Falha ao adicionar projeto. Verifique o console para mais detalhes.');
    }
  };

  const updateProject = async (id: number, name: string, link: string, imageFile?: File) => {
    try {
      const updatedProject = await api.updateProject(id, name, link, imageFile);
      setProjects(prevProjects => 
        prevProjects.map(p => (p.id === id ? updatedProject : p))
      );
      alert('Projeto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      alert('Falha ao atualizar projeto. Verifique o console para mais detalhes.');
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await api.deleteProject(id);
      setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
      alert('Projeto deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      alert('Falha ao deletar projeto. Verifique o console para mais detalhes.');
    }
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
        
        {isLoading ? (
          <div className="py-20 text-center">
            <p className="text-zinc-400">Carregando projetos...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={loadProjects}
              className="mt-4 bg-[#FF007F] text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <PortfolioSection projects={projects} />
        )}
        
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
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
        />
      )}
    </div>
  );
};

export default App;
