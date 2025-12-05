import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './Flashcards.module.css';
import { generateFlashcards, type FlashcardData } from '../../services/api';

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  source?: { file: string; page: number };
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
}

interface FlashcardsProps {
  attachedFiles?: string[];
  onClearAttachments?: () => void;
}

function FlashcardItem({ card }: { card: Flashcard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return styles.difficultyEasy;
      case 'medium': return styles.difficultyMedium;
      case 'hard': return styles.difficultyHard;
      default: return '';
    }
  };

  return (
    <div
      className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}
      onClick={() => setIsFlipped((prev) => !prev)}
    >
      <div className={styles.flashcardInner}>
        <div className={styles.flashcardFront}>
          <div className={styles.cardHeader}>
            <span className={styles.cardNumber}>#{card.id}</span>
            {card.difficulty && (
              <span className={`${styles.difficulty} ${getDifficultyColor(card.difficulty)}`}>
                {card.difficulty}
              </span>
            )}
          </div>
          <p className={styles.cardQuestion}>{card.question}</p>
          {card.topic && <span className={styles.topic}>{card.topic}</span>}
        </div>
        <div className={styles.flashcardBack}>
          <p className={styles.cardAnswer}>{card.answer}</p>
          {card.source && (
            <span className={styles.source}>
              📄 {card.source.file}, pág {card.source.page}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Flashcards({ attachedFiles = [], onClearAttachments }: FlashcardsProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleGenerate = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const promptText = prompt.trim() || 'Genera flashcards sobre el contexto adjuntado.';
      const result = await generateFlashcards(
        promptText,
        attachedFiles.length > 0 ? attachedFiles : undefined
      );

      // Validar que la respuesta tenga la estructura esperada
      if (!result.data || !result.data.flashcards || !Array.isArray(result.data.flashcards)) {
        throw new Error('La respuesta de la API no tiene el formato esperado');
      }

      const newCards: Flashcard[] = result.data.flashcards.map((fc: FlashcardData) => ({
        id: fc.id,
        question: fc.question,
        answer: fc.answer,
        source: fc.source,
        difficulty: fc.difficulty,
        topic: fc.topic,
      }));

      setCards(newCards);
      setPrompt('');
      
      if (onClearAttachments) {
        onClearAttachments();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar flashcards');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, attachedFiles, isLoading, onClearAttachments]);

  // Scroll al inicio cuando se generan nuevas cards
  useEffect(() => {
    if (cards.length > 0 && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [cards]);

  const getFileName = (key: string) => {
    return key.split('/').pop() || key;
  };

  return (
    <div className={styles.flashcardsContainer}>
      <div className={styles.generateSection}>
        {attachedFiles.length > 0 && (
          <div className={styles.attachedPreview}>
            <span className={styles.attachedLabel}>Archivos seleccionados:</span>
            <div className={styles.attachedList}>
              {attachedFiles.map((file, index) => (
                <span key={index} className={styles.attachedChip}>
                  📎 {getFileName(file)}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className={styles.generateForm}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tema o instrucción para las flashcards..."
            className={styles.promptInput}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleGenerate}
            className={styles.generateButton}
            disabled={isLoading}
          >
            {isLoading ? 'Generando...' : 'Generar'}
          </button>
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>

      <div className={styles.flashcardsList} ref={containerRef}>
        {cards.length === 0 && !isLoading ? (
          <div className={styles.emptyFlashcards}>
            <svg
              className={styles.emptyIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
              />
            </svg>
            <p>Selecciona archivos y genera flashcards</p>
          </div>
        ) : (
          cards.map((card) => (
            <FlashcardItem key={card.id} card={card} />
          ))
        )}
        
        {isLoading && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <span>Generando flashcards...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Flashcards;
