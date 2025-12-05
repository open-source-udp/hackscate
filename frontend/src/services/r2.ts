const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface R2File {
  fileName: string;
  key: string;
  size?: number;
  lastModified?: Date;
}

export async function listFiles(folder: string): Promise<R2File[]> {
  const response = await fetch(`${API_URL}/api/files/${encodeURIComponent(folder)}`);
  
  if (!response.ok) {
    throw new Error('Error al obtener la lista de archivos');
  }
  
  return response.json();
}

export async function downloadFile(key: string): Promise<void> {
  const url = `${API_URL}/api/download?key=${encodeURIComponent(key)}`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = key.split('/').pop() || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
