import styles from './FileItem.module.css';

interface FileItemProps {
  fileName: string;
  fileKey: string;
  onDownload: (key: string) => void;
}

function FileItem({ fileName, fileKey, onDownload }: FileItemProps) {
  const handleClick = () => {
    onDownload(fileKey);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={styles.fileItem}
      title={fileName}
    >
      <span className={styles.fileName}>{fileName}</span>
    </button>
  );
}

export default FileItem;
