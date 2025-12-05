import { useState } from 'react';
import styles from './ToolsPanel.module.css';
import Chat from '../Chat';
import Flashcards from '../Flashcards';
import MindMap from '../MindMap';

type ToolTab = 'chat' | 'flashcards' | 'mindmap';

function ToolsPanel() {
  const [activeTab, setActiveTab] = useState<ToolTab>('chat');

  return (
    <div className={styles.toolsPanel}>
      <div className={styles.tabsHeader}>
        <button
          className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <svg
            className={styles.tabIcon}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
            />
          </svg>
          Chat
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'flashcards' ? styles.active : ''}`}
          onClick={() => setActiveTab('flashcards')}
        >
          <svg
            className={styles.tabIcon}
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
          Flashcards
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'mindmap' ? styles.active : ''}`}
          onClick={() => setActiveTab('mindmap')}
        >
          <svg
            className={styles.tabIcon}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
            />
          </svg>
          Mapa
        </button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'flashcards' && <Flashcards />}
        {activeTab === 'mindmap' && <MindMap />}
      </div>
    </div>
  );
}

export default ToolsPanel;
