import { useEffect, useState } from 'react';
import './App.css'
import FileList from './components/FileList';
import { listFiles, downloadFile } from './services/r2';
import type { R2File } from './services/r2';

function App() {
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const fileList = await listFiles('eit/CIT-2013');
        setFiles(fileList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar archivos');
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, []);

  const handleDownload = async (key: string) => {
    try {
      await downloadFile(key);
    } catch (err) {
      console.error('Error al descargar:', err);
    }
  };

  if (loading) {
    return <main><p>Cargando archivos...</p></main>;
  }

  if (error) {
    return <main><p>Error: {error}</p></main>;
  }

  return (
    <main>
      <FileList files={files} onDownload={handleDownload} />
    </main>
  )
}

export default App
