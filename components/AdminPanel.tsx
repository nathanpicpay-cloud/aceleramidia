
import React, { useState, useEffect } from 'react';
import type { Project } from '../App';
import { Paperclip, AlertCircle, CheckCircle } from 'lucide-react';

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
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
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
        <img src={project.image} alt={project.name} className="w-16 h-16 object-cover rounded flex-shrink-0 bg-zinc-900" />
        <div className="overflow-hidden">
          <p className="font-semibold truncate">{project.name}</p>
          {project.owner && <p className="text-xs text-zinc-500 truncate">Proprietário: {project.owner}</p>}
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-blue-400 break-all truncate block">
            {project.link}
          </a>
          {project.attachment && (
            <a href={project.attachment} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-green-400 break-all truncate block mt-1">
              <span className="flex items-center gap-1"><Paperclip size={12} /> Ver Anexo</span>
            </a>
          )}
        </div>
      </div>
      <div className="flex space-x-2 ml-4 flex-shrink-0">
        <button onClick={onEdit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">Editar</button>
        <button onClick={handleDeleteClick} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Excluir</button>
      </div>
    </div>
  );
};

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', owner: '', link: '', image: '', attachment: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEditingProject(null);
    setFormData({ name: '', owner: '', link: '', image: '', attachment: '' });
    setPreviewUrl('');
    setError(null);
    // Don't clear success message immediately so user can see it
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  useEffect(() => {
    if (editingProject) {
      setFormData({ 
        name: editingProject.name, 
        owner: editingProject.owner || '',
        link: editingProject.link, 
        image: editingProject.image,
        attachment: editingProject.attachment || '' 
      });
      setPreviewUrl(editingProject.image);
      setError(null);
      setSuccessMessage(null);
    }
  }, [editingProject]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'image') {
      setPreviewUrl(value);
    }
  };

  // Automatically convert Imgur gallery links to direct image links on blur
  const handleImageBlur = () => {
    let url = formData.image.trim();
    // Regex to detect imgur.com/ID without i.imgur.com and without file extension
    const imgurRegex = /^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/;
    const match = url.match(imgurRegex);

    if (match && match[1]) {
        const newUrl = `https://i.imgur.com/${match[1]}.png`;
        setFormData(prev => ({ ...prev, image: newUrl }));
        setPreviewUrl(newUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.name || !formData.link) {
      setError("Nome do Projeto e Link URL são obrigatórios.");
      return;
    }
    if (!formData.image) {
      setError("Um link de imagem (Imgur) é obrigatório.");
      return;
    }

    setIsSaving(true);
    
    try {
        const projectData: Partial<Project> = {
            name: formData.name,
            owner: formData.owner || undefined,
            link: formData.link,
            image: formData.image,
            attachment: formData.attachment || null,
        };
        
        if (editingProject) {
            await onUpdateProject({ ...projectData, id: editingProject.id });
            setSuccessMessage("Projeto atualizado com sucesso!");
        } else {
            await onAddProject(projectData as Omit<Project, 'id' | 'created_at' | 'updated_at'>);
            setSuccessMessage("Projeto adicionado com sucesso!");
            // Clear form data only on successful add (not edit, though logic handles resetForm)
            setFormData({ name: '', owner: '', link: '', image: '', attachment: '' });
            setPreviewUrl('');
        }
        setEditingProject(null);
        
        // We manually reset form data above if add, but resetForm does cleanup
        setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
        console.error("Failed to save project:", err);
        setError(err.message || 'Um erro inesperado ocorreu.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setSuccessMessage(null);
    setError(null);
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (project: Project) => {
    try {
        await onDeleteProject(project);
        setSuccessMessage("Projeto excluído com sucesso!");
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
        console.error("Delete operation failed in ProjectManager:", err);
        setError(`Falha ao excluir: ${err.message}`);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-white">
        <div id="project-form" className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-lg mb-8">
            <h3 className="font-bold mb-4 text-xl">{editingProject ? 'Editar Projeto' : 'Adicionar Novo Projeto'}</h3>
            
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle size={16} />
                    <span>{successMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome do Projeto" required className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>
              
              <input type="text" name="owner" value={formData.owner} onChange={handleInputChange} placeholder="Nome do Proprietário / Cliente" className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                      <label htmlFor="image-url" className="block text-sm font-medium text-zinc-300 mb-2">
                          Link da Imagem (Imgur)
                      </label>
                      <input 
                          id="image-url"
                          type="text" 
                          name="image" 
                          value={formData.image}
                          onChange={handleInputChange}
                          onBlur={handleImageBlur} 
                          placeholder="https://i.imgur.com/..."
                          required
                          className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"
                      />
                      <p className="text-xs text-zinc-500 mt-1">
                        Cole o link direto da imagem. Recomendado: <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-[#FF007F] hover:underline">Upload no Imgur</a>
                      </p>
                  </div>
                  {previewUrl && (
                      <div className="flex justify-start">
                          <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-zinc-700 bg-zinc-900" />
                      </div>
                  )}
              </div>

              <div>
                <label htmlFor="attachment-url" className="block text-sm font-medium text-zinc-300 mb-2">
                    Link do Anexo (Opcional)
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
                <p className="text-xs text-zinc-500 mt-1">Cole um link para um arquivo externo (ex: Google Drive, Dropbox).</p>
              </div>

              <input type="text" name="link" value={formData.link} onChange={handleInputChange} placeholder="URL do Projeto" required className="w-full bg-zinc-700 p-2 rounded text-white placeholder-zinc-400"/>
              
              <div>
                <div className="flex space-x-4 items-center">
                  <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? 'Salvando...' : (editingProject ? 'Atualizar Projeto' : 'Adicionar Projeto')}
                  </button>
                  {editingProject && (
                    <button type="button" onClick={handleCancelEdit} className="bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded">
                      Cancelar Edição
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-3">
                  Todas as alterações são salvas automaticamente.
                </p>
              </div>
            </form>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-xl">Projetos Existentes</h3>
            {projects.length === 0 && (
                <p className="text-zinc-500 italic">Nenhum projeto encontrado.</p>
            )}
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
