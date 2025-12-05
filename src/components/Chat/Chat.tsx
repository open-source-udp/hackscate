import { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  attachedFiles?: string[];
}

interface ChatProps {
  attachedFiles?: string[];
  onClearAttachments?: () => void;
}

function Chat({ attachedFiles = [], onClearAttachments }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };)

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    
    // Limpiar archivos adjuntos después de enviar
    if (onClearAttachments) {
      onClearAttachments();
    }
    
    setIsLoading(true);

    // Simular respuesta del bot (aquí puedes integrar una API de chat)
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: 'Esta es una respuesta de ejemplo. Puedes integrar una API de chat aquí.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const getFileName = (key: string) => {
    return key.split('/').pop() || key;
  };

  return (
    <div className={styles.chat}>
      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <div className={styles.emptyChat}>
            <p>Escribe un mensaje para comenzar la conversación</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.sender === 'user' ? styles.messageUser : styles.messageBot
              }`}
            >
              {message.attachedFiles && message.attachedFiles.length > 0 && (
                <div className={styles.messageAttachments}>
                  {message.attachedFiles.map((file, index) => (
                    <span key={index} className={styles.attachmentChip}>
                      📎 {getFileName(file)}
                    </span>
                  ))}
                </div>
              )}
              {message.text && <p className={styles.messageText}>{message.text}</p>}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInputContainer}>
        {attachedFiles.length > 0 && (
          <div className={styles.attachedFilesPreview}>
            <span className={styles.attachedLabel}>Archivos adjuntos:</span>
            <div className={styles.attachedFilesList}>
              {attachedFiles.map((file, index) => (
                <span key={index} className={styles.attachedFileChip}>
                  📎 {getFileName(file)}
                </span>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.chatForm}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={attachedFiles.length > 0 ? "Añade un mensaje o envía los archivos..." : "Escribe un mensaje..."}
            className={styles.chatInput}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.chatSendButton}
            disabled={isLoading || (!inputValue.trim() && attachedFiles.length === 0)}
          >
            {isLoading ? '...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
