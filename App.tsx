
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
import { AlertTriangle, Copy, RefreshCw, Check, ArrowRight } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  owner?: string; // Novo campo para o proprietário
  image: string;
  link: string;
  attachment?: string | null;
  created_at: string;
  updated_at: string;
}

const SQL_SETUP_CODE = `
-- ⚠️ WARNING: This will reset the projects table to fix schema and RLS errors
drop table if exists projects;

-- Create the table
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner text, -- Coluna para o proprietário/cliente
  image text not null,
  link text not null,
  attachment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table projects enable row level security;

-- Create permissive policies (Fixes RLS Errors)
create policy "Enable read access for all users" on "public"."projects" as PERMISSIVE for SELECT to public using (true);
create policy "Enable insert for all users" on "public"."projects" as PERMISSIVE for INSERT to public with check (true);
create policy "Enable update for all users" on "public"."projects" as PERMISSIVE for UPDATE to public using (true);
create policy "Enable delete for all users" on "public"."projects" as PERMISSIVE for DELETE to public using (true);
`;

const DatabaseSetupScreen: React.FC<{ onRetry: () => void; onSkip: () => void }> = ({ onRetry, onSkip }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_SETUP_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
       <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-[#FF007F] rounded-full blur-[150px] opacity-20"></div>
      </div>
      
      <div className="max-w-3xl w-full bg-zinc-900 border border-red-900/50 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center gap-4 mb-6 text-red-500">
          <AlertTriangle size={48} />
          <div>
            <h1 className="text-2xl font-bold text-white">Inconsistência no Banco de Dados</h1>
            <p className="text-zinc-400">A estrutura do seu banco de dados está desatualizada (colunas ausentes) ou requer correção de permissões.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Ação Necessária</h3>
            <ol className="list-decimal list-inside space-y-2 text-zinc-300">
              <li>Acesse seu <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#FF007F] hover:underline">Painel Supabase</a>.</li>
              <li>Abra o <strong>Editor SQL</strong> na barra lateral.</li>
              <li>Copie o código abaixo e execute-o para <strong>REDEFINIR</strong> a tabela e <strong>CORRIGIR COLUNAS</strong>.</li>
            </ol>
          </div>

          <div className="relative group">
            <div className="absolute top-2 right-2">
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 px-3 rounded transition-colors"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? "Copiado!" : "Copiar SQL"}
              </button>
            </div>
            <pre className="bg-black/50 p-4 rounded-lg text-sm text-zinc-300 font-mono overflow-x-auto border border-zinc-800 custom-scrollbar h-48">
              {SQL_SETUP_CODE.trim()}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={onRetry}
              className="flex-1 bg-[#FF007F] hover:bg-[#d9006c] text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,127,0.4)]"
            >
              <RefreshCw size={20} />
              Tentar Novamente
            </button>
            
            <button 
              onClick={onSkip}
              className="sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              Continuar Offline
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [route, setRoute] = useState(window.location.hash.substring(1) || '/');
  const [isLoading, setIsLoading] = useState(true);
  const [showDbSetup, setShowDbSetup] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.substring(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setShowDbSetup(false); // Reset setup screen state on retry
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const projectList = (data || []).map((item: any) => ({
          id: item.id ? item.id.toString() : Math.random().toString(36).substr(2, 9), // Ensure ID exists
          name: item.name || 'Sem título',
          owner: item.owner || '', // Map owner field
          image: item.image || '',
          link: item.link || '#',
          attachment: item.attachment || null,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
      }));
      setProjects(projectList);
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      
      if (errorMessage.includes("Invalid API key")) {
          console.warn("A chave da API Supabase é inválida ou está ausente.");
      } else if (errorMessage.includes("Could not find the table") || errorMessage.includes("relation \"public.projects\" does not exist")) {
          console.error("⚠️ TABELA AUSENTE NO SUPABASE ⚠️");
          setShowDbSetup(true);
      } else {
          console.error("Erro ao buscar projetos:", errorMessage);
      }
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
      alert('Senha incorreta.');
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
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      console.error('Erro ao adicionar projeto:', errorMessage);
      
      // Check for RLS policies or schema constraints (Includes Portuguese translations)
      if (errorMessage.includes("violates not-null constraint") || 
          errorMessage.includes("column \"proprietário\"") || 
          errorMessage.includes("column 'owner'") ||
          errorMessage.includes("Could not find the column") ||
          errorMessage.includes("Não foi possível encontrar a coluna") || // Portuguese check
          errorMessage.includes("cache do esquema") || // Portuguese check
          errorMessage.includes("value in column") ||
          errorMessage.includes("row-level security policy")) {
         setShowDbSetup(true); 
         throw new Error("Incompatibilidade de esquema do banco de dados. Siga as instruções na tela.");
      }

      throw new Error(`Falha ao adicionar projeto: ${errorMessage}`);
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
    } catch (error: any) {
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        console.error('Erro ao atualizar projeto:', errorMessage);
         if (errorMessage.includes("row-level security policy") || 
             errorMessage.includes("column 'owner'") || 
             errorMessage.includes("Não foi possível encontrar a coluna") ||
             errorMessage.includes("Could not find the column")) {
             setShowDbSetup(true);
             throw new Error("Incompatibilidade de esquema do banco de dados. Siga as instruções na tela.");
         }
        throw new Error(`Falha ao atualizar projeto: ${errorMessage}`);
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
    } catch (error: any) {
        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        console.error('Erro ao excluir projeto:', errorMessage);
         if (errorMessage.includes("row-level security policy")) {
             setShowDbSetup(true);
             throw new Error("Erro de permissão do banco de dados. Siga as instruções na tela.");
         }
        throw new Error(`Falha ao excluir projeto: ${errorMessage}`);
    }
  };

  const renderContent = () => {
    if (showDbSetup) {
        return <DatabaseSetupScreen onRetry={fetchProjects} onSkip={() => setShowDbSetup(false)} />;
    }

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
