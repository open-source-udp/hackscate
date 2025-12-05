import styles from './FileItem.module.css';

interface FileItemProps {
  fileName: string;
  fileKey: string;
  isSelected?: boolean;
  onDownload: (key: string) => void;
  onSelect?: (key: string) => void;
}

function FileItem({ fileName, fileKey, isSelected, onDownload, onSelect }: FileItemProps) {
  const handleCheckboxChange = () => {
    if (onSelect) {
      onSelect(fileKey);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(fileKey);
  };

  return (
    <div className={`${styles.fileItem} ${isSelected ? styles.selected : ''}`}>
      <label className={styles.checkboxWrapper}>
        <input
          type="checkbox"
          checked={isSelected || false}
          onChange={handleCheckboxChange}
          className={styles.checkbox}
        />
        <span className={styles.customCheckbox}>
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      </label>
      <span className={styles.fileName} title={fileName}>{fileName}</span>
      <button
        type="button"
        onClick={handleDownload}
        className={styles.downloadButton}
        title="Descargar archivo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="18" height="18">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>
    </div>
  );
}

export default FileItem;
