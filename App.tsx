
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
import { initializeFirebase, FirebaseInstances } from './lib/firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

export interface Project {
  id: string; // Firestore uses string IDs
  name: string;
  image: string;
  link: string;
  created_at: string;
  updated_at: string;
}

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [route, setRoute] = useState(window.location.hash.substring(1) || '/');
  const [isLoading, setIsLoading] = useState(true);
  const [firebase, setFirebase] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // Attempt to initialize Firebase from localStorage on initial load
    const savedConfig = localStorage.getItem('firebaseConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        const instances = initializeFirebase(config);
        if (instances) {
          setFirebase(instances);
        }
      } catch (e) {
        console.error("Failed to parse or initialize with saved Firebase config.", e);
        localStorage.removeItem('firebaseConfig'); // Clear invalid config
      }
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.substring(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!firebase?.db) {
      setProjects([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const projectsCollection = collection(firebase.db, 'projects');
      const q = query(projectsCollection, orderBy('created_at', 'desc'));
      const projectSnapshot = await getDocs(q);
      const projectList = projectSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              name: data.name,
              image: data.image,
              link: data.link,
              created_at: (data.created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
              updated_at: (data.updated_at as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          };
      });
      setProjects(projectList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      alert("Could not load projects. Please check your connection and refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, [firebase]);

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
  
  const handleConfigSave = (configString: string) => {
    try {
      const config = JSON.parse(configString);
      const instances = initializeFirebase(config);
      if (instances) {
        setFirebase(instances);
        localStorage.setItem('firebaseConfig', configString);
        return true;
      }
      return false;
    } catch (e) {
      alert("Invalid JSON format for Firebase config.");
      console.error("Error parsing Firebase config:", e);
      return false;
    }
  };

  const addProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
     if (!firebase?.db) {
        alert("Database not connected. Please configure Firebase in Site Settings.");
        return;
      }
    try {
      await addDoc(collection(firebase.db, 'projects'), {
        ...project,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      await fetchProjects();
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project.');
    }
  };

  const updateProject = async (projectToUpdate: Pick<Project, 'id' | 'name' | 'image' | 'link'>) => {
    if (!firebase?.db) {
        alert("Database not connected. Cannot update project.");
        return;
    }
    const { id, ...updateData } = projectToUpdate;
    try {
        const projectDoc = doc(firebase.db, 'projects', id);
        await updateDoc(projectDoc, {
            ...updateData,
            updated_at: serverTimestamp(),
        });
        await fetchProjects();
    } catch (error) {
        console.error('Error updating project:', error);
        alert('Failed to update project.');
    }
  };


  const deleteProject = async (projectToDelete: Project) => {
     if (!firebase?.db || !firebase?.storage) {
        alert("Database or Storage not connected. Cannot delete project.");
        return;
    }
    try {
        if (projectToDelete.image) {
            const imageRef = ref(firebase.storage, projectToDelete.image);
            await deleteObject(imageRef).catch(error => {
                if (error.code !== 'storage/object-not-found') {
                    throw error;
                }
                console.warn("Image not found in storage, but proceeding with DB deletion.");
            });
        }
        await deleteDoc(doc(firebase.db, 'projects', projectToDelete.id));
        await fetchProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project.');
    }
  };

  const renderContent = () => {
    if (isLoading && !firebase) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center">
                <p className="text-white">Loading...</p>
            </div>
        );
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
            onConfigSave={handleConfigSave}
            firebase={firebase}
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
