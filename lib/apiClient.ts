// Configuração da URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Project {
  id: number;
  name: string;
  image: string;
  link: string;
  created_at: string;
  updated_at: string;
}

// GET - Buscar todos os projetos
export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar projetos: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    throw error;
  }
}

// POST - Criar novo projeto
export async function createProject(
  name: string,
  imageFile: File,
  link: string
): Promise<Project> {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', imageFile);
    formData.append('link', link);

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar projeto');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    throw error;
  }
}

// PUT - Atualizar projeto
export async function updateProject(
  id: number,
  name: string,
  link: string,
  imageFile?: File
): Promise<Project> {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('link', link);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar projeto');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    throw error;
  }
}

// DELETE - Deletar projeto
export async function deleteProject(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao deletar projeto');
    }
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    throw error;
  }
}

// Health check
export async function checkHealth(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('API não está respondendo');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro no health check:', error);
    throw error;
  }
}
