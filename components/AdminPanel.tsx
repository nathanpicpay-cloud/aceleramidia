import React, { useState, useEffect } from 'react';
import type { Project } from '../App';
import { Paperclip } from 'lucide-react';

interface ProjectManagerProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateProject: (project: Partial<Project> & { id: string }) => Promise<void>;
  onDeleteProject: (project: Project) => Promise<void>;
}

const ProjectListItem: React.FC<{
  project: Project;
  onEdit: () => void;
  onDelete: (project: Project) => Promise<void>;
}> = ({ project, onEdit, onDelete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setIsVisible(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      await onDelete(project);
    }
  };

  return (
    <div
      className={`bg-zinc-800 p-3 rounded-lg flex items-center justify-between transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-center space-x-4 overflow-hidden">
        <img src={project.image} alt={project.name} className="w-16 h-16 object-cover rounded flex-shrink-0" />
        <div className="overflow-hidden">
          <p className="font-semibold truncate">{project.name}</p>
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-blue-400 break-all truncate block">
            {project.link}
          </a>
          {project.attachment && (
            <a href={project.attachment} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-green-400 break-all truncate block mt-1">
              <span className="flex items-center gap-1"><Paperclip size={12} /> View Attachment</span>
            </a>
          )}
        </div>
      </div>
      <div className="flex space-x-2 ml-4 flex-shrink-0">
        <button onClick={onEdit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">Edit</button>
        <button onClick={handleDeleteClick} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Delete</button>
      </div>
    </div>
  );
};

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', link: '', image: '', attachment: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingProject(null);
    setFormData({ name: '', link: '', image: '', attachment: '' });
    setPreviewUrl('');
    setError(null);
  };

  useEffect(() => {
    if (editingProject) {
      setFormData({ 
        name: editingProject.name, 
        link: editingProject.link, 
        image: editingProject.image,
        attachment: editingProject.attachment || '' 
      });
      setPreviewUrl(editingProject.image);
      setError(null);
    } else {
      resetForm();
    }
  }, [editingProject]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'image') {
      setPreviewUrl(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.link) {
      setError("Project Name and Link URL are required.");
      return;
    }
    if (!formData.image) {
      setError("An image URL (Imgur) is required.");
      return;
    }

    setIsSaving(true);
    
    try {
        const projectData: Partial<Project> = {
            name: formData.name,
            link: formData.link,
            image: formData.image,
            attachment: formData.attachment || null,
        };
        
        if (editingProject) {
            await onUpdateProject({ ...projectData, id: editingProject.id });
        } else {
            await onAddProject(projectData as Omit<Project, 'id' | 'created_at' | 'updated_at'>);
        }

        resetForm();

    } catch (err: any) {
        console.error("Failed to save project:", err);
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (project: Project) => {
    try {
        await onDeleteProject(project);
    } catch (err: any) {
        console.error("Delete operation failed in ProjectManager:", err);
        setError(`Failed to delete: ${err.message}`);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-white">
        <div id="project-form" className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-lg mb-8">
            <h3 className="font-bold mb-4 text-xl">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Project Name" required className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                      <label htmlFor="image-url" className="block text-sm font-medium text-zinc-300 mb-2">
                          Image URL (Imgur)
                      </label>
                      <input 
                          id="image-url"
                          type="text" 
                          name="image" 
                          value={formData.image}
                          onChange={handleInputChange} 
                          placeholder="https://i.imgur.com/..."
                          required
                          className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Paste the direct link to the image.</p>
                  </div>
                  {previewUrl && (
                      <div className="flex justify-start">
                          <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-zinc-700" />
                      </div>
                  )}
              </div>

              <div>
                <label htmlFor="attachment-url" className="block text-sm font-medium text-zinc-300 mb-2">
                    Attachment URL (Optional)
                </label>
                <input 
                    id="attachment-url"
                    type="text" 
                    name="attachment" 
                    value={formData.attachment}
                    onChange={handleInputChange} 
                    placeholder="https://..."
                    className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"
                />
                <p className="text-xs text-zinc-500 mt-1">Paste a link to an external file (e.g. Google Drive, Dropbox).</p>
              </div>

              <input type="text" name="link" value={formData.link} onChange={handleInputChange} placeholder="Link URL" required className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>
              
              <div>
                <div className="flex space-x-4 items-center">
                  <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? 'Saving...' : (editingProject ? 'Update Project' : 'Add Project')}
                  </button>
                  {editingProject && (
                    <button type="button" onClick={handleCancelEdit} className="bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded">
                      Cancel Edit
                    </button>
                  )}
                </div>
                {error && <p className="text-red-400 text-sm mt-3 bg-red-900/30 p-2 rounded-md">{error}</p>}
                <p className="text-xs text-zinc-400 mt-3">
                  Todas as alterações são salvas automaticamente.
                </p>
              </div>
            </form>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-xl">Existing Projects</h3>
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectListItem
                  key={project.id}
                  project={project}
                  onEdit={() => handleEdit(project)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
    </div>
  );
};

export default ProjectManager;