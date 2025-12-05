import { useEffect, useState, useMemo, useCallback } from 'react';
import styles from './App.module.css';
import FileList from './components/FileList';
import ToolsPanel from './components/ToolsPanel';
import SearchBar from './components/SearchBar';
import { listFiles, downloadFile } from './services/r2';
import { smartSearch } from './services/api';
import type { R2File } from './services/r2';

function App() {
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [smartSearchActive, setSmartSearchActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [smartSearchResults, setSmartSearchResults] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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

  // Ejecutar búsqueda inteligente cuando cambia la query y está activa
  const executeSmartSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSmartSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const result = await smartSearch(query);
      console.log('Smart search sources:', result.sources);
      console.log('Available files:', files.map(f => f.fileName));
      setSmartSearchResults(result.sources);
    } catch (err) {
      console.error('Error en búsqueda inteligente:', err);
      setSmartSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [files]);

  // Debounce para la búsqueda inteligente
  useEffect(() => {
    if (!smartSearchActive) {
      setSmartSearchResults(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      executeSmartSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, smartSearchActive, executeSmartSearch]);

  // Función para normalizar nombres de archivo para comparación
  const normalizeFileName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\.pdf$/i, '')
      .replace(/[_\-\s]+/g, '') // Eliminar guiones, guiones bajos y espacios
      .trim();
  };

  const filteredFiles = useMemo(() => {
    // Si la búsqueda inteligente está activa y hay resultados, filtrar por ellos
    if (smartSearchActive && smartSearchResults !== null) {
      if (smartSearchResults.length === 0) return [];
      
      // Normalizar los nombres de los resultados de búsqueda
      const normalizedSources = smartSearchResults.map(normalizeFileName);
      
      // Filtrar archivos cuyos nombres coincidan con los resultados de búsqueda
      return files.filter((file) => {
        const normalizedFileName = normalizeFileName(file.fileName);
        return normalizedSources.some((source) => 
          normalizedFileName.includes(source) || source.includes(normalizedFileName)
        );
      });
    }

    // Búsqueda normal por nombre
    if (!searchQuery.trim()) return files;
    const query = searchQuery.toLowerCase();
    return files.filter((file) => file.fileName.toLowerCase().includes(query));
  }, [files, searchQuery, smartSearchActive, smartSearchResults]);

  const handleDownload = async (key: string) => {
    try {
      await downloadFile(key);
    } catch (err) {
      console.error('Error al descargar:', err);
    }
  };

  const handleSmartSearchToggle = () => {
    setSmartSearchActive((prev) => !prev);
    if (smartSearchActive) {
      setSmartSearchResults(null);
    }
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
              isSearching={isSearching}
            />
            {smartSearchActive && smartSearchResults !== null && (
              <div className={styles.searchResultsInfo}>
                {isSearching ? (
                  <span>Buscando...</span>
                ) : (
                  <span>
                    {smartSearchResults.length} archivo(s) encontrado(s) con contenido relacionado
                  </span>
                )}
              </div>
            )}
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
