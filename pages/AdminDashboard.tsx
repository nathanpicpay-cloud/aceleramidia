
import React from 'react';
import type { Project } from '../App';
import ProjectManager from '../components/AdminPanel';
import { Home, LogOut, Briefcase } from 'lucide-react';

interface AdminDashboardProps {
    projects: Project[];
    onAddProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    onUpdateProject: (project: Partial<Project> & { id: string }) => Promise<void>;
    onDeleteProject: (project: Project) => Promise<void>;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    projects, 
    onAddProject, 
    onUpdateProject, 
    onDeleteProject, 
    onLogout 
}) => {

    return (
        <div className="bg-zinc-900 text-white min-h-screen flex font-sans">
            <aside className="w-64 bg-black p-6 flex flex-col justify-between border-r border-zinc-800">
                <div>
                    <div className="flex items-center space-x-2 mb-12">
                         <img src="https://i.imgur.com/p6rDq9M.png" alt="Acelera Mídia Logo" className="h-8 w-auto" />
                         <span className="font-bold text-xl font-manrope">Admin</span>
                    </div>
                    <nav className="flex flex-col space-y-2">
                        <a href="#/admin" 
                           className='flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 bg-[#FF007F] text-white'>
                           <Briefcase size={20} />
                           <span>Projects</span>
                        </a>
                    </nav>
                </div>
                <div className="flex flex-col space-y-2">
                    <a href="/#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors duration-200">
                        <Home size={20} />
                        <span>Back to Site</span>
                    </a>
                    <button onClick={onLogout} className="flex items-center space-x-3 p-3 w-full text-left rounded-lg hover:bg-zinc-800 transition-colors duration-200">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <ProjectManager 
                    projects={projects}
                    onAddProject={onAddProject}
                    onUpdateProject={onUpdateProject}
                    onDeleteProject={onDeleteProject}
                />
            </main>
        </div>
    );
};

export default AdminDashboard;
