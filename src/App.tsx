import { useEffect, useState, useMemo } from 'react';
import styles from './App.module.css';
import FileList from './components/FileList';
import ToolsPanel from './components/ToolsPanel';
import SearchBar from './components/SearchBar';
import { listFiles, downloadFile } from './services/r2';
import type { R2File } from './services/r2';

function App() {
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [smartSearchActive, setSmartSearchActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const fileList = await listFiles('plan-comun/CII-2750');
        setFiles(fileList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar archivos');
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const query = searchQuery.toLowerCase();
    return files.filter((file) => file.fileName.toLowerCase().includes(query));
  }, [files, searchQuery]);

  const handleDownload = async (key: string) => {
    try {
      await downloadFile(key);
    } catch (err) {
      console.error('Error al descargar:', err);
    }
  };

  const handleSmartSearchToggle = () => {
    setSmartSearchActive((prev) => !prev);
  };

  const handleFileSelect = (key: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleClearAttachments = () => {
    setSelectedFiles([]);
  };

  return (
    <div className={styles.appContainer}>
      <section className={styles.filesSection}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <p>Cargando archivos...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>Error: {error}</p>
          </div>
        ) : (
          <>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              smartSearchActive={smartSearchActive}
              onSmartSearchToggle={handleSmartSearchToggle}
            />
            <FileList 
              files={filteredFiles} 
              selectedFiles={selectedFiles}
              onDownload={handleDownload} 
              onSelect={handleFileSelect}
            />
          </>
        )}
      </section>
      <aside className={styles.chatSection}>
        <ToolsPanel 
          attachedFiles={selectedFiles}
          onClearAttachments={handleClearAttachments}
        />
      </aside>
    </div>
  );
}

export default App;
