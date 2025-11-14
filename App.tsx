
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
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Check session storage for admin status on initial load
    if (sessionStorage.getItem('isAdmin') === 'true') {
      setIsAdmin(true);
    }

    // Fetch initial projects from Firestore
    const fetchProjects = async () => {
      if (!db) {
        console.warn("Firestore is not initialized. Cannot fetch projects.");
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
                // Convert Firestore Timestamps to ISO strings
                created_at: (data.created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                updated_at: (data.updated_at as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            };
        });
        setProjects(projectList);
      } catch (error) {
        console.error("Error fetching projects:", error);
        alert("Could not load projects. Please check your connection and refresh the page.");
      }
    };

    fetchProjects();
  }, []);
  
  const handleLoginAttempt = (password: string) => {
    // IMPORTANT: This is an insecure method of authentication and should be
    // replaced with a proper auth system (like Firebase Auth) for production.
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
      // Add to local state immediately for instant UI update
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

        // Update local state for instant UI feedback
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
        // 1. Delete the image from Firebase Storage
        if (projectToDelete.image) {
            // Firebase Storage SDK's refFromURL can handle the public URL directly
            const imageRef = ref(storage, projectToDelete.image);
            await deleteObject(imageRef).catch(error => {
                // It's okay if the image doesn't exist, log a warning but don't block deletion.
                if (error.code !== 'storage/object-not-found') {
                    throw error;
                }
                console.warn("Image not found in storage, but proceeding with DB deletion.");
            });
        }

        // 2. Delete the record from the database
        await deleteDoc(doc(db, 'projects', projectToDelete.id));
        
        // 3. Update the local state
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project.');
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
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
        />
      )}
    </div>
  );
};

export default App;
