
import React, { useState, useEffect } from 'react';
import type { Project } from '../App';
import { ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage';

interface ProjectManagerProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateProject: (project: Pick<Project, 'id' | 'name' | 'image' | 'link'>) => Promise<void>;
  onDeleteProject: (project: Project) => Promise<void>;
  storage: FirebaseStorage | null;
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
      // Wait for animation to complete before deleting
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
        </div>
      </div>
      <div className="flex space-x-2 ml-4 flex-shrink-0">
        <button onClick={onEdit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">Edit</button>
        <button onClick={handleDeleteClick} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Delete</button>
      </div>
    </div>
  );
};

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onAddProject, onUpdateProject, onDeleteProject, storage }) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', link: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingProject(null);
    setFormData({ name: '', link: '' });
    setImageFile(null);
    setPreviewUrl('');
    setError(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  useEffect(() => {
    if (editingProject) {
      setFormData({ name: editingProject.name, link: editingProject.link });
      setPreviewUrl(editingProject.image);
      setImageFile(null);
      setError(null);
    } else {
        // Only reset if not editing.
        // This prevents form clearing during an edit action.
        resetForm();
    }
  }, [editingProject]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setError(null);

    // --- Validation ---
    if (!formData.name || !formData.link) {
      setError("Project Name and Link URL are required.");
      return;
    }
    if (!editingProject && !imageFile) {
      setError("An image file is required for new projects.");
      return;
    }
    if (!storage) {
      setError("Storage is not configured. Go to Site Settings to configure Firebase.");
      return;
    }

    setIsUploading(true);
    let newImageUrl: string | null = null;
    
    try {
        const oldImageUrl = editingProject?.image;

        // --- Step 1: Upload new image if it exists ---
        if (imageFile) {
            const imageRef = ref(storage, `project-images/${Date.now()}_${imageFile.name}`);
            const uploadResult = await uploadBytes(imageRef, imageFile);
            newImageUrl = await getDownloadURL(uploadResult.ref);
        }

        const finalImageUrl = newImageUrl || oldImageUrl;
        
        if (!finalImageUrl) {
            // This should not happen due to the validation above, but as a safeguard:
            throw new Error("Project image is missing. Please select an image to upload.");
        }

        const projectData = {
            name: formData.name,
            image: finalImageUrl,
            link: formData.link,
        };

        // --- Step 2: Save to Database ---
        if (editingProject) {
            await onUpdateProject({ ...projectData, id: editingProject.id });
        } else {
            await onAddProject(projectData);
        }

        // --- Step 3: Clean up old image if a new one was uploaded successfully ---
        if (newImageUrl && oldImageUrl && oldImageUrl.includes('firebasestorage.googleapis.com')) {
            try {
                const oldImageRef = ref(storage, oldImageUrl);
                await deleteObject(oldImageRef);
            } catch (deleteError) {
                // Non-critical error, the main operation succeeded. Log it.
                console.warn("Project saved, but failed to delete old image:", deleteError);
            }
        }
      
        // --- Step 4: Reset form on success ---
        resetForm();

    } catch (err: any) {
        console.error("Failed to save project:", err);
        setError(err.message || 'An unexpected error occurred. Please check console for details.');

        // --- Cleanup Step: Delete orphaned new image if DB operation failed ---
        if (newImageUrl) {
            console.log("Database operation failed. Cleaning up orphaned image...");
            try {
                const orphanRef = ref(storage, newImageUrl);
                await deleteObject(orphanRef);
                console.log("Orphaned image deleted.");
            } catch (cleanupError) {
                console.error("Failed to clean up orphaned image. Manual deletion may be required:", newImageUrl, cleanupError);
            }
        }
    } finally {
        // --- Final Step: Always reset loading state ---
        setIsUploading(false);
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
        {!storage && (
            <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-4 rounded-lg mb-8 text-center">
                <p className="font-bold">Firebase Not Configured</p>
                <p className="text-sm">Image and project management is disabled. Please go to <span className="font-semibold">Site Settings</span> to provide your Firebase configuration.</p>
            </div>
        )}
        <div id="project-form" className={`bg-zinc-800/50 border border-zinc-700 p-6 rounded-lg mb-8 transition-opacity ${!storage ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-bold mb-4 text-xl">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Project Name" required className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>
              
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium text-zinc-300 mb-2">
                            {editingProject ? 'Upload New Image (Optional)' : 'Upload Image'}
                        </label>
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
              </div>

              <input type="text" name="link" value={formData.link} onChange={handleInputChange} placeholder="Link URL" required className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>
              <div>
                <div className="flex space-x-4 items-center">
                  <button type="submit" disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? 'Saving...' : (editingProject ? 'Update Project' : 'Add Project')}
                  </button>
                  {editingProject && (
                    <button type="button" onClick={handleCancelEdit} className="bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded">
                      Cancel Edit
                    </button>
                  )}
                </div>
                {error && <p className="text-red-400 text-sm mt-3 bg-red-900/30 p-2 rounded-md">{error}</p>}
                <p className="text-xs text-zinc-400 mt-3">
                  Todas as alterações de imagens e links feitas neste painel serão salvas e atualizadas para todos os usuários.
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