
import React, { useState, useEffect } from 'react';

interface Project {
  name: string;
  image: string;
  link: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

const ProjectListItem: React.FC<{
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ project, onEdit, onDelete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // A small delay to allow the component to mount before starting the animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setIsVisible(false);
      // Wait for the fade-out animation to complete before removing the item
      setTimeout(onDelete, 300);
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
        </div>
      </div>
      <div className="flex space-x-2 ml-4 flex-shrink-0">
        <button onClick={onEdit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">Edit</button>
        <button onClick={handleDeleteClick} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Delete</button>
      </div>
    </div>
  );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, projects, onProjectsChange }) => {
  const [editingProject, setEditingProject] = useState<Project & { index: number } | null>(null);
  const [formData, setFormData] = useState({ name: '', image: '', link: '' });

  useEffect(() => {
    if (editingProject) {
      setFormData({ name: editingProject.name, image: editingProject.image, link: editingProject.link });
    } else {
      setFormData({ name: '', image: '', link: '' });
    }
  }, [editingProject]);
  
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      // Update existing project
      const updatedProjects = [...projects];
      updatedProjects[editingProject.index] = { name: formData.name, image: formData.image, link: formData.link };
      onProjectsChange(updatedProjects);
    } else {
      // Add new project
      onProjectsChange([...projects, formData]);
    }
    setEditingProject(null);
    setFormData({ name: '', image: '', link: '' });
  };

  const handleEdit = (project: Project, index: number) => {
    setEditingProject({ ...project, index });
  };
  
  const handleDelete = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    onProjectsChange(updatedProjects);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setFormData({ name: '', image: '', link: '' });
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Panel - Manage Projects</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Form Section */}
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-4 text-lg">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Project Name" required className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>
              
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium text-zinc-300 mb-2">Upload Image</label>
                        <input 
                            id="image-upload"
                            type="file" 
                            name="imageFile" 
                            onChange={handleFileChange} 
                            accept="image/*"
                            className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
                        />
                    </div>
                    {formData.image && (
                        <div className="flex justify-start">
                            <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-zinc-700" />
                        </div>
                    )}
                </div>
                <input 
                    type="text" 
                    name="image" 
                    value={formData.image} 
                    onChange={handleInputChange} 
                    placeholder="Or paste Image URL" 
                    required 
                    className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400 mt-2"
                />
              </div>

              <input type="text" name="link" value={formData.link} onChange={handleInputChange} placeholder="Link URL" required className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>
              <div>
                <div className="flex space-x-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    {editingProject ? 'Update Project' : 'Add Project'}
                  </button>
                  {editingProject && (
                    <button type="button" onClick={handleCancelEdit} className="bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded">
                      Cancel Edit
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-3">
                  Todas as alterações de imagens e links feitas neste painel serão salvas e atualizadas para todos os usuários.
                </p>
              </div>
            </form>
          </div>

          {/* Projects List */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Existing Projects</h3>
            <div className="space-y-3">
              {projects.map((project, index) => (
                <ProjectListItem
                  key={`${project.name}-${index}`}
                  project={project}
                  onEdit={() => handleEdit(project, index)}
                  onDelete={() => handleDelete(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
