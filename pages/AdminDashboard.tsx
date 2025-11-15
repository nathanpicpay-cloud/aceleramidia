
import React, { useState, useEffect } from 'react';
import type { Project } from '../App';
import ProjectManager from '../components/AdminPanel';
import { Home, LogOut, Settings, Briefcase } from 'lucide-react';
import { FirebaseInstances } from '../lib/firebaseClient';

interface SiteSettingsProps {
    onConfigSave: (config: string) => boolean;
}

const SiteSettings: React.FC<SiteSettingsProps> = ({ onConfigSave }) => {
    const [config, setConfig] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const savedConfig = localStorage.getItem('firebaseConfig');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                setConfig(JSON.stringify(parsed, null, 2));
            } catch {
                setConfig(savedConfig);
            }
        }
    }, []);

    const handleSave = () => {
        setMessage(null);
        if (!config.trim()) {
            setMessage({ text: 'Configuration cannot be empty.', type: 'error' });
            return;
        }
        if (onConfigSave(config)) {
            setMessage({ text: 'Configuration saved! The app will now use this configuration.', type: 'success' });
        } else {
            setMessage({ text: 'Failed to save configuration. Please check if the JSON is valid.', type: 'error' });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto text-white">
            <h2 className="text-2xl font-bold mb-4">Site Settings</h2>
            <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-lg">
                <h3 className="font-bold mb-2 text-xl">Firebase Configuration</h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Paste your Firebase project configuration JSON here. This is required for project and image storage to work.
                    You can find this in your Firebase project settings under "General".
                </p>
                <textarea
                    value={config}
                    onChange={(e) => setConfig(e.target.value)}
                    placeholder='{ "apiKey": "...", "authDomain": "...", ... }'
                    className="w-full h-64 bg-zinc-900 border border-zinc-700 p-3 rounded text-white placeholder-zinc-500 font-mono text-sm"
                />
                <button
                    onClick={handleSave}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                >
                    Save Configuration
                </button>
                {message && (
                    <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
};

interface AdminDashboardProps {
    projects: Project[];
    onAddProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    onUpdateProject: (project: Pick<Project, 'id' | 'name' | 'image' | 'link'>) => Promise<void>;
    onDeleteProject: (project: Project) => Promise<void>;
    onLogout: () => void;
    onConfigSave: (config: string) => boolean;
    firebase: FirebaseInstances | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState('projects');

    useEffect(() => {
        // If firebase is not configured, force the user to the settings page for a better UX.
        if (!props.firebase) {
            setActiveTab('settings');
        }
    }, [props.firebase]);


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

            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'projects' && (
                    <ProjectManager 
                        projects={props.projects}
                        onAddProject={props.onAddProject}
                        onUpdateProject={props.onUpdateProject}
                        onDeleteProject={props.onDeleteProject}
                        storage={props.firebase?.storage || null}
                    />
                )}
                {activeTab === 'settings' && (
                   <>
                        {!props.firebase && (
                            <div className="bg-blue-900/50 border border-blue-700 text-blue-200 p-4 rounded-lg mb-8 text-center animate-pulse">
                                <p className="font-bold text-lg">Configuration Required</p>
                                <p className="text-sm">Welcome! Please provide your Firebase configuration below to enable all admin features.</p>
                            </div>
                        )}
                       <SiteSettings onConfigSave={props.onConfigSave} />
                   </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
