import FileItem from '../FileItem/FileItem';
import styles from './FileList.module.css';

export interface FileData {
  fileName: string;
  key: string;
}

interface FileListProps {
  files: FileData[];
  onDownload: (key: string) => void;
}

function FileList({ files, onDownload }: FileListProps) {
  return (
    <div className={styles.fileList}>
      {files.length === 0 ? (
        <p className={styles.emptyMessage}>No hay archivos disponibles</p>
      ) : (
        files.map((file, index) => (
          <FileItem
            key={`${file.key}-${index}`}
            fileName={file.fileName}
            fileKey={file.key}
            onDownload={onDownload}
          />
        ))
      )}
    </div>
  );
}

export default FileList;
