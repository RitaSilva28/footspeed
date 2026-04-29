import { useState, useEffect, useCallback } from "react";
import type { ExerciseSettings, CompletedExercise, CalledColor } from "../types";
import styles from "./Exercise.module.css";

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
  const [colorSequence, setColorSequence] = useState<CalledColor[]>([]);
  const [nextCallCountdown, setNextCallCountdown] = useState(settings.interval);
  const [countdown, setCountdown] = useState<number | null>(null);

  const getRandomColor = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * settings.cones.length);
    return settings.cones[randomIndex];
  }, [settings.cones]);

  const speakColor = useCallback((colorName: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(colorName);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const handleStart = useCallback(() => {
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (countdown === null || countdown < 0) return;

    if (countdown === 0) {
      speakColor("Go");

      queueMicrotask(() => {
        setIsActive(true);
        setNextCallCountdown(0);
        setCountdown(null);
      });

      return;
    }

    speakColor(countdown.toString());

    const countdownTimer = setTimeout(() => {
      setCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => clearTimeout(countdownTimer);
  }, [countdown, speakColor]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timeInterval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      queueMicrotask(() => {
        setIsActive(false);
      });

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
  }, [
    timeLeft,
    isActive,
    colorSequence,
    onComplete,
    settings.duration,
    settings.interval,
  ]);

  useEffect(() => {
    if (!isActive || nextCallCountdown > 0) return;

    const newColor = getRandomColor();
    speakColor(newColor.name);

    queueMicrotask(() => {
      setCurrentColor(newColor.name);
      setColorSequence((prev) => [
        ...prev,
        { name: newColor.name, color: newColor.color },
      ]);
      setNextCallCountdown(settings.interval);
    });
  }, [isActive, nextCallCountdown, getRandomColor, speakColor, settings.interval]);

  useEffect(() => {
    if (!isActive || nextCallCountdown <= 0) return;

    const countdownInterval = setInterval(() => {
      setNextCallCountdown((prev) => {
        if (prev <= 1) return 0;
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

      <div className={styles.timerSection}>
        <h1 className={styles.timer}>
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </h1>
        <p className={styles.conesCalledCount}>
          Cones called: {colorSequence.length}
        </p>
      </div>

      {isActive && currentColor && currentColorObj && (
        <div
          className={styles.currentColorDisplay}
          style={{ backgroundColor: currentColorObj.color }}
        >
          <p className={styles.colorText}>{currentColor}</p>
        </div>
      )}

      {isActive && (
        <p className={styles.nextCallInfo}>
          Next call in: {nextCallCountdown}s
        </p>
      )}

      <div className={styles.controls}>
        {!isActive && timeLeft === settings.duration && countdown === null ? (
          <button onClick={handleStart} className={styles.startBtn}>
            Start
          </button>
        ) : (
          <button onClick={onCancel} className={styles.cancelBtn}>
            Back
          </button>
        )}
      </div>

      {colorSequence.length > 0 && (
        <div className={styles.colorHistory}>
          <h3 className={styles.historyTitle}>Colors Called</h3>

          <div className={styles.colorHistoryList}>
            {colorSequence.map((color, index) => (
              <div key={index} className={styles.historyItem}>
                <div
                  className={styles.historyDot}
                  style={{ backgroundColor: color.color }}
                />
                <span>{color.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}