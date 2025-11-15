
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
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import { db, storage } from './lib/firebaseClient';
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

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.substring(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setIsLoading(true);
      // Check session storage for admin status
      if (sessionStorage.getItem('isAdmin') === 'true') {
        setIsAdmin(true);
      }

      // Fetch initial projects from Firestore
      if (!db) {
        console.warn("Firestore is not initialized. Cannot fetch projects.");
        setIsLoading(false);
        return;
      }
      try {
        const projectsCollection = collection(db, 'projects');
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
      }
      setIsLoading(false);
    };

    checkAuthAndFetchData();
  }, []);
  
  const handleLoginAttempt = (password: string) => {
    if (password === '777') { 
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      window.location.hash = '/admin'; // Redirect to admin dashboard
    } else {
      alert('Incorrect password.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    window.location.hash = '/'; 
  }

  const addProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
     if (!db) {
        alert("Database not connected. Cannot add project.");
        return;
      }
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...project,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      const newProject: Project = {
        ...project,
        id: docRef.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProjects(prevProjects => [newProject, ...prevProjects]);
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project.');
    }
  };

  const updateProject = async (projectToUpdate: Pick<Project, 'id' | 'name' | 'image' | 'link'>) => {
    if (!db) {
        alert("Database not connected. Cannot update project.");
        return;
    }
    const { id, ...updateData } = projectToUpdate;
    try {
        const projectDoc = doc(db, 'projects', id);
        await updateDoc(projectDoc, {
            ...updateData,
            updated_at: serverTimestamp(),
        });

        const updatedProjectInState = {
            ...projectToUpdate,
            created_at: projects.find(p => p.id === id)?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        setProjects(prevProjects => 
            prevProjects.map(p => (p.id === id ? updatedProjectInState : p))
        );
    } catch (error) {
        console.error('Error updating project:', error);
        alert('Failed to update project.');
    }
  };


  const deleteProject = async (projectToDelete: Project) => {
     if (!db || !storage) {
        alert("Database or Storage not connected. Cannot delete project.");
        return;
    }
    try {
        if (projectToDelete.image) {
            const imageRef = ref(storage, projectToDelete.image);
            await deleteObject(imageRef).catch(error => {
                if (error.code !== 'storage/object-not-found') {
                    throw error;
                }
                console.warn("Image not found in storage, but proceeding with DB deletion.");
            });
        }
        await deleteDoc(doc(db, 'projects', projectToDelete.id));
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project.');
    }
  };

  const renderContent = () => {
    if (isLoading) {
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
          />
        );
      } else {
        // Redirect to login if not authenticated and not already there
        if (cleanRoute !== '/login') {
            window.location.hash = '/login';
        }
        // Render login page while redirecting
        return <LoginPage onLoginSubmit={handleLoginAttempt} />;
      }
    }

    if (cleanRoute.startsWith('/login')) {
        return <LoginPage onLoginSubmit={handleLoginAttempt} />;
    }

    // Default route: main site
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
