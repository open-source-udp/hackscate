import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './Flashcards.module.css';

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

interface FlashcardsProps {
  initialCards?: Flashcard[];
}

// Simulación de datos para el infinite scroll
const generateMoreCards = (startId: number, count: number): Flashcard[] => {
  const questions = [
    { q: '¿Qué es React?', a: 'Una biblioteca de JavaScript para construir interfaces de usuario' },
    { q: '¿Qué es un componente?', a: 'Una pieza reutilizable de código que representa una parte de la interfaz' },
    { q: '¿Qué es el estado en React?', a: 'Un objeto que almacena datos que pueden cambiar durante el ciclo de vida del componente' },
    { q: '¿Qué es JSX?', a: 'Una extensión de sintaxis para JavaScript que permite escribir HTML en React' },
    { q: '¿Qué son los props?', a: 'Datos que se pasan de un componente padre a un componente hijo' },
    { q: '¿Qué es el Virtual DOM?', a: 'Una representación ligera del DOM real que React usa para optimizar actualizaciones' },
    { q: '¿Qué es un hook?', a: 'Funciones que permiten usar estado y otras características de React en componentes funcionales' },
    { q: '¿Qué hace useEffect?', a: 'Permite realizar efectos secundarios en componentes funcionales' },
    { q: '¿Qué es el contexto en React?', a: 'Una forma de pasar datos a través del árbol de componentes sin props' },
    { q: '¿Qué es Redux?', a: 'Una biblioteca para manejar el estado global de la aplicación' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const idx = (startId + i) % questions.length;
    return {
      id: startId + i,
      question: questions[idx].q,
      answer: questions[idx].a,
    };
  });
};

const initialDefaultCards: Flashcard[] = generateMoreCards(1, 5);

function FlashcardItem({ card }: { card: Flashcard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}
      onClick={() => setIsFlipped((prev) => !prev)}
    >
      <div className={styles.flashcardInner}>
        <div className={styles.flashcardFront}>
          <span className={styles.cardNumber}>#{card.id}</span>
          {card.question}
        </div>
        <div className={styles.flashcardBack}>
          {card.answer}
        </div>
      </div>
    </div>
  );
}

function Flashcards({ initialCards = initialDefaultCards }: FlashcardsProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreCards = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simular delay de carga desde API
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const newCards = generateMoreCards(cards.length + 1, 5);
    
    // Simular fin de datos después de 30 cards
    if (cards.length >= 25) {
      setHasMore(false);
    } else {
      setCards((prev) => [...prev, ...newCards]);
    }
    
    setIsLoading(false);
  }, [cards.length, isLoading, hasMore]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMoreCards();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreCards, hasMore, isLoading]);

  if (cards.length === 0 && !isLoading) {
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

  return (
    <div className={styles.flashcardsContainer}>
      <div className={styles.flashcardsList}>
        {cards.map((card) => (
          <FlashcardItem key={card.id} card={card} />
        ))}
        
        <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
          {isLoading && (
            <div className={styles.loader}>
              <div className={styles.spinner}></div>
              <span>Cargando más flashcards...</span>
            </div>
          )}
          {!hasMore && cards.length > 0 && (
            <p className={styles.endMessage}>No hay más flashcards</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Flashcards;
