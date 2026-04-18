import { useState } from 'react';
import { Settings as SettingsIcon, History as HistoryIcon } from 'lucide-react';
import logo from '../assets/Logotitle.svg'; 
import type { ExerciseSettings, CompletedExercise, Screen } from '../types';
import Settings from './Settings';
import Exercise from './Exercise';
import History from './History';
import styles from './Main.module.css';

export default function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('settings');
  const [currentSettings, setCurrentSettings] = useState<ExerciseSettings | null>(
    null
  );
  const [exercises, setExercises] = useState<CompletedExercise[]>(() => {
    const saved = localStorage.getItem('exerciseHistory');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const handleStartExercise = (settings: ExerciseSettings) => {
    setCurrentSettings(settings);
    setCurrentScreen('exercise');
  };

  const handleCompleteExercise = (exercise: CompletedExercise) => {
    const updated = [exercise, ...exercises];
    setExercises(updated);
    localStorage.setItem('exerciseHistory', JSON.stringify(updated));
    setCurrentScreen('settings');
  };

  const handleCancelExercise = () => {
    setCurrentScreen('settings');
  };

  const handleBackFromHistory = () => {
    setCurrentScreen('settings');
  };

  return (
    <div className={styles.app}>
      <nav className={styles.navbar}>
      <img src={logo} alt="FootSpeed Logo" className={styles.logoImage} />

        <div className={styles.navButtons}>
          <button
            className={`${styles.navBtn} ${
              currentScreen === 'settings' ? styles.active : ''
            }`}
            onClick={() => setCurrentScreen('settings')}
            disabled={currentScreen === 'exercise'}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>

          <button
            className={`${styles.navBtn} ${
              currentScreen === 'history' ? styles.active : ''
            }`}
            onClick={() => setCurrentScreen('history')}
            disabled={currentScreen === 'exercise'}
          >
            <HistoryIcon size={18} />
            <span>History</span>
          </button>
        </div>
      </nav>

      <main className={styles.content}>
        {currentScreen === 'settings' && (
          <Settings onStartExercise={handleStartExercise} />
        )}
        {currentScreen === 'exercise' && currentSettings && (
          <Exercise
            settings={currentSettings}
            onComplete={handleCompleteExercise}
            onCancel={handleCancelExercise}
          />
        )}
        {currentScreen === 'history' && (
          <History onBack={handleBackFromHistory} />
        )}
      </main>
    </div>
  );
}