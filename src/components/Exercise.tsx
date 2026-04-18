import { useState, useEffect, useCallback } from 'react';
import type { ExerciseSettings, CompletedExercise } from '../types';
import styles from './Exercise.module.css';

interface ExerciseScreenProps {
  settings: ExerciseSettings;
  onComplete: (exercise: CompletedExercise) => void;
  onCancel: () => void;
}

export default function ExerciseScreen({
  settings,
  onComplete,
  onCancel,
}: ExerciseScreenProps) {
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [colorSequence, setColorSequence] = useState<string[]>([]);
  const [nextCallCountdown, setNextCallCountdown] = useState(settings.interval);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Get a random color
  const getRandomColor = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * settings.cones.length);
    return settings.cones[randomIndex];
  }, [settings.cones]);

  // Speak the color name
  const speakColor = useCallback((colorName: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(colorName);
      utterance.lang = 'en-US';
      utterance.rate = 1.2;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Start the exercise with countdown
  const handleStart = useCallback(() => {
    setCountdown(3);
  }, []);

  // Handle countdown before exercise starts
  useEffect(() => {
    if (countdown === null || countdown < 0) return;

    if (countdown === 0) {
      // Speak "Go!" and start exercise
      speakColor('Go');
      // Use a microtask to update state after current effect finishes
      queueMicrotask(() => {
        setIsActive(true);
        setNextCallCountdown(0);
        setCountdown(null);
      });
      return;
    }

    // Speak the current countdown number only once
    speakColor(countdown.toString());

    // Schedule next countdown
    const countdownTimer = setTimeout(() => {
      setCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => clearTimeout(countdownTimer);
  }, [countdown, speakColor]);

  // Main exercise timer loop
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timeInterval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [isActive, timeLeft]);

  // Handle exercise completion when time runs out
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      queueMicrotask(() => {
        setIsActive(false);
      });
      // Complete exercise
      const exercise: CompletedExercise = {
        id: Date.now().toString(),
        date: new Date(),
        duration: settings.duration,
        interval: settings.interval,
        conesCount: colorSequence.length,
        colorSequence,
      };
      onComplete(exercise);
    }
  }, [timeLeft, isActive, colorSequence, onComplete, settings.duration, settings.interval]);

  // Handle color call intervals
  useEffect(() => {
    if (!isActive || nextCallCountdown > 0) return;

    // Call a new color
    const newColor = getRandomColor();
    speakColor(newColor.name);
    
    // Defer state updates to after the effect
    queueMicrotask(() => {
      setCurrentColor(newColor.name);
      setColorSequence((prev) => [...prev, newColor.name]);
      setNextCallCountdown(settings.interval);
    });
  }, [isActive, nextCallCountdown, getRandomColor, speakColor, settings.interval]);

  // Countdown to next color call
  useEffect(() => {
    if (!isActive || nextCallCountdown <= 0) return;

    const countdownInterval = setInterval(() => {
      setNextCallCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isActive, nextCallCountdown]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const currentColorObj = settings.cones.find((c) => c.name === currentColor);

  return (
    <div className={styles.container}>
      {/* Countdown Display */}
      {countdown !== null && (
        <div className={styles.countdownOverlay}>
          <div className={styles.countdownDisplay}>
            {countdown > 0 ? (
              <h1 className={styles.countdownNumber}>{countdown}</h1>
            ) : (
              <h1 className={styles.countdownGo}>GO!</h1>
            )}
          </div>
        </div>
      )}

      {/* Timer */}
      <div className={styles.timerSection}>
        <h1 className={styles.timer}>
          {minutes.toString().padStart(2, '0')}:{seconds
            .toString()
            .padStart(2, '0')}
        </h1>
        <p className={styles.conesCalledCount}>Cones called: {colorSequence.length}</p>
      </div>

      {/* Current Color Display */}
      {isActive && currentColor && currentColorObj && (
        <div
          className={styles.currentColorDisplay}
          style={{ backgroundColor: currentColorObj.color }}
        >
          <p className={styles.colorText}>{currentColor}</p>
        </div>
      )}

      {/* Next Call Countdown */}
      {isActive && (
        <p className={styles.nextCallInfo}>
          Next call in: {nextCallCountdown}s
        </p>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        {!isActive && timeLeft === settings.duration && countdown === null ? (
          <button onClick={handleStart} className={styles.startBtn}>
            Start
          </button>
        ) : (
          <>
            <button onClick={onCancel} className={styles.cancelBtn}>
              Back
            </button>
          </>
        )}
      </div>

      {/* Color History */}
      {colorSequence.length > 0 && (
        <div className={styles.colorHistory}>
          <h3 className={styles.historyTitle}>Colors Called</h3>
          <div className={styles.colorHistoryList}>
            {colorSequence.map((color, index) => {
              const colorObj = settings.cones.find((c) => c.name === color);
              return (
                <div key={index} className={styles.historyItem}>
                  <div
                    className={styles.historyDot}
                    style={{
                      backgroundColor: colorObj?.color,
                    }}
                  />
                  <span>{color}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
