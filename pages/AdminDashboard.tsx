
import React, { useState } from 'react';
import type { Project } from '../App';
import ProjectManager from '../components/AdminPanel';
import { Home, LogOut, Settings, Briefcase } from 'lucide-react';


interface AdminDashboardProps {
    projects: Project[];
    onAddProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
    onUpdateProject: (project: Pick<Project, 'id' | 'name' | 'image' | 'link'>) => void;
    onDeleteProject: (project: Project) => void;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState('projects');

    return (
        <div className="bg-zinc-900 text-white min-h-screen flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-black p-6 flex flex-col justify-between border-r border-zinc-800">
                <div>
                    <div className="flex items-center space-x-2 mb-12">
                         <img src="https://i.imgur.com/p6rDq9M.png" alt="Acelera Mídia Logo" className="h-8 w-auto" />
                         <span className="font-bold text-xl font-manrope">Admin</span>
                    </div>
                    <nav className="flex flex-col space-y-2">
                        <a href="#/admin" 
                           onClick={() => setActiveTab('projects')}
                           className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${activeTab === 'projects' ? 'bg-[#FF007F] text-white' : 'hover:bg-zinc-800'}`}>
                           <Briefcase size={20} />
                           <span>Projects</span>
                        </a>
                        <a href="#/admin" 
                           onClick={() => setActiveTab('settings')}
                           className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${activeTab === 'settings' ? 'bg-[#FF007F] text-white' : 'hover:bg-zinc-800'}`}>
                           <Settings size={20} />
                           <span>Site Settings</span>
                        </a>
                    </nav>
                </div>
                <div className="flex flex-col space-y-2">
                    <a href="/#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors duration-200">
                        <Home size={20} />
                        <span>Back to Site</span>
                    </a>
                    <button onClick={props.onLogout} className="flex items-center space-x-3 p-3 w-full text-left rounded-lg hover:bg-zinc-800 transition-colors duration-200">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'projects' && (
                    <ProjectManager 
                        projects={props.projects}
                        onAddProject={props.onAddProject}
                        onUpdateProject={props.onUpdateProject}
                        onDeleteProject={props.onDeleteProject}
                    />
                )}
                {activeTab === 'settings' && (
                    <div>
                        <h2 className="text-2xl font-bold">Site Settings</h2>
                        <p className="text-zinc-400 mt-4">This section is under construction.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

// Simple icons for demonstration
const LucideIcon: React.FC<{ icon: React.FC<any>, className?: string }> = ({ icon: Icon, className }) => <Icon className={className || "h-5 w-5"} />;

export default AdminDashboard;