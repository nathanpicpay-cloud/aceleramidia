
import React, { useState, useEffect, useCallback } from 'react';
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
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import { supabase } from './lib/supabaseClient';

export interface Project {
  id: string;
  name: string;
  image: string;
  link: string;
  attachment?: string | null;
  created_at: string;
  updated_at: string;
}

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [route, setRoute] = useState(window.location.hash.substring(1) || '/');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.substring(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectList = (data || []).map((item: any) => ({
          id: item.id.toString(), // Ensure ID is string
          name: item.name,
          image: item.image,
          link: item.link,
          attachment: item.attachment || null,
          created_at: item.created_at,
          updated_at: item.updated_at,
      }));
      setProjects(projectList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      // alert("Could not load projects.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => {
        if (sessionStorage.getItem('isAdmin') === 'true') {
            setIsAdmin(true);
        }
    };
    checkAuth();
    fetchProjects();
  }, [fetchProjects]);
  
  const handleLoginAttempt = (password: string) => {
    if (password === '777') { 
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      window.location.hash = '/admin';
    } else {
      alert('Incorrect password.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    window.location.hash = '/'; 
  }

  const addProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('projects')
        .insert([project]);
        
      if (error) throw error;
      
      await fetchProjects();
    } catch (error) {
      console.error('Error adding project:', error);
      const message = `Failed to add project. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`;
      throw new Error(message);
    }
  };

  const updateProject = async (projectToUpdate: Partial<Project> & { id: string }): Promise<void> => {
    const { id, ...updateData } = projectToUpdate;
    try {
        const { error } = await supabase
            .from('projects')
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw error;
        
        await fetchProjects();
    } catch (error) {
        console.error('Error updating project:', error);
        const message = `Failed to update project. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`;
        throw new Error(message);
    }
  };

  const deleteProject = async (projectToDelete: Project): Promise<void> => {
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectToDelete.id);

        if (error) throw error;
        
        await fetchProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        const message = `Failed to delete project. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`;
        throw new Error(message);
    }
  };

  const renderContent = () => {
    const cleanRoute = route.toLowerCase();

    if (cleanRoute.startsWith('/admin')) {
      if (isAdmin) {
        return (
          <AdminDashboard 
            projects={projects}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
            onLogout={handleLogout}
          />
        );
      } else {
        if (cleanRoute !== '/login') {
            window.location.hash = '/login';
        }
        return <LoginPage onLoginSubmit={handleLoginAttempt} />;
      }
    }

    if (cleanRoute.startsWith('/login')) {
        return <LoginPage onLoginSubmit={handleLoginAttempt} />;
    }

    return (
      <div className="bg-black text-white overflow-x-hidden relative">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-[#FF007F] rounded-full blur-[200px] opacity-10"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-600 rounded-full blur-[200px] opacity-10"></div>
        </div>
        <SparklesBackground className="fixed inset-0 z-0" />
        
        <Header isAdmin={isAdmin} onLogout={handleLogout} />
        
        <main className="relative z-10">
          <HeroSection />
          <BenefitsSection />
          <PortfolioSection projects={projects} />
          <AboutSection />
          <ServicesSection />
          <TeamSection />
          <ContactSection />
        </main>
        
        <Footer />
      </div>
    );
  };
  
  return renderContent();
};

export default App;
