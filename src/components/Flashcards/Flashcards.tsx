import { useState } from 'react';
import styles from './Flashcards.module.css';

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

interface FlashcardsProps {
  cards?: Flashcard[];
}

const defaultCards: Flashcard[] = [
  { id: 1, question: '¿Qué es React?', answer: 'Una biblioteca de JavaScript para construir interfaces de usuario' },
  { id: 2, question: '¿Qué es un componente?', answer: 'Una pieza reutilizable de código que representa una parte de la interfaz' },
  { id: 3, question: '¿Qué es el estado en React?', answer: 'Un objeto que almacena datos que pueden cambiar durante el ciclo de vida del componente' },
];

function Flashcards({ cards = defaultCards }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : prev));
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  if (cards.length === 0) {
    return (
      <div className={styles.flashcardsContainer}>
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
          <p>No hay flashcards disponibles</p>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className={styles.flashcardsContainer}>
      <div className={styles.flashcardWrapper}>
        <div
          className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}
          onClick={handleFlip}
        >
          <div className={styles.flashcardInner}>
            <div className={styles.flashcardFront}>
              {currentCard.question}
            </div>
            <div className={styles.flashcardBack}>
              {currentCard.answer}
            </div>
          </div>
        </div>
        <p className={styles.flipHint}>Click para voltear</p>
        
        <div className={styles.flashcardControls}>
          <button
            className={styles.controlButton}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            title="Anterior"
          >
            <svg
              className={styles.controlIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <span className={styles.cardCounter}>
            {currentIndex + 1} / {cards.length}
          </span>
          
          <button
            className={styles.controlButton}
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            title="Siguiente"
          >
            <svg
              className={styles.controlIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Flashcards;
