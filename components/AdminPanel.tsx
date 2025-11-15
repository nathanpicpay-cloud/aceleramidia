import React, { useState, useEffect } from 'react';
import type { Project } from '../App';
import { storage } from '../lib/firebaseClient';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateProject: (project: Pick<Project, 'id' | 'name' | 'image' | 'link'>) => void;
  onDeleteProject: (project: Project) => void;
}

const ProjectListItem: React.FC<{
  project: Project;
  onEdit: () => void;
  onDelete: (project: Project) => void;
}> = ({ project, onEdit, onDelete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setIsVisible(false);
      setTimeout(() => onDelete(project), 300);
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

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, projects, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', image: '', link: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (editingProject) {
      setFormData({ name: editingProject.name, image: editingProject.image, link: editingProject.link });
      setPreviewUrl(editingProject.image);
    } else {
      setFormData({ name: '', image: '', link: '' });
      setPreviewUrl('');
    }
    setImageFile(null);
  }, [editingProject]);
  
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'image') {
      setPreviewUrl(value); // Update preview if URL is pasted manually
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (!imageFile && !formData.image) || !formData.link) {
      alert("Please fill all fields and provide an image.");
      return;
    }

    if (!storage) {
        alert("Storage is not configured. Cannot upload image.");
        return;
    }

    setIsUploading(true);
    let finalImageUrl = formData.image;

    // If a new file is selected, upload it to Firebase Storage
    if (imageFile) {
      try {
        // If we are editing an existing project, delete the old image first.
        if (editingProject?.image) {
          const oldImageRef = ref(storage, editingProject.image);
          await deleteObject(oldImageRef).catch(err => {
            if (err.code !== 'storage/object-not-found') throw err;
            console.warn("Old image not found, proceeding with upload.");
          });
        }

        // Upload the new image
        const imageRef = ref(storage, `project-images/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(uploadResult.ref);

      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        alert("Failed to upload image. Please try again.");
        setIsUploading(false);
        return;
      }
    }

    const projectData = {
      name: formData.name,
      image: finalImageUrl,
      link: formData.link,
    };

    if (editingProject) {
      onUpdateProject({ ...projectData, id: editingProject.id });
    } else {
      onAddProject(projectData);
    }
    
    setEditingProject(null);
    setFormData({ name: '', image: '', link: '' });
    setImageFile(null);
    setPreviewUrl('');
    setIsUploading(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (project: Project) => {
    onDeleteProject(project);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Panel - Manage Projects</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div id="project-form" className="bg-zinc-800 p-4 rounded-lg mb-6">
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
                    {previewUrl && (
                        <div className="flex justify-start">
                            <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-zinc-700" />
                        </div>
                    )}
                </div>
                <input 
                    type="text" 
                    name="image" 
                    value={formData.image} 
                    onChange={handleInputChange} 
                    placeholder="Or paste Image URL" 
                    className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400 mt-2"
                />
              </div>

              <input type="text" name="link" value={formData.link} onChange={handleInputChange} placeholder="Link URL" required className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>
              <div>
                <div className="flex space-x-4">
                  <button type="submit" disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? 'Saving...' : (editingProject ? 'Update Project' : 'Add Project')}
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

          <div>
            <h3 className="font-bold mb-4 text-lg">Existing Projects</h3>
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
      </div>
    </div>
  );
};

export default AdminPanel;