import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Settings as SettingsIcon,
  History as HistoryIcon,
  LogOut,
} from "lucide-react";
import logo from "../assets/Logotitle.svg";
import type { ExerciseSettings, CompletedExercise, Screen } from "../types";
import Settings from "./Settings";
import Exercise from "./Exercise";
import History from "./History";
import styles from "./Main.module.css";

type MainAppProps = {
  userEmail: string;
  userId: string;
};

export default function MainApp({ userEmail, userId }: MainAppProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>("settings");
  const [currentSettings, setCurrentSettings] =
    useState<ExerciseSettings | null>(null);
  const [exercises, setExercises] = useState<CompletedExercise[]>([]);

  useEffect(() => {
    async function loadHistory() {
      const { data, error } = await supabase
        .from("exercise_history")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error loading history:", error);
        return;
      }

      const mappedExercises: CompletedExercise[] = data.map((item) => ({
        id: item.id,
        date: new Date(item.date),
        duration: item.duration,
        interval: item.interval,
        conesCount: item.cones_count,
        colorSequence: item.color_sequence,
      }));

      setExercises(mappedExercises);
    }

    loadHistory();
  }, [userId]);

  const handleStartExercise = (settings: ExerciseSettings) => {
    setCurrentSettings(settings);
    setCurrentScreen("exercise");
  };

  const handleCompleteExercise = async (exercise: CompletedExercise) => {
    const { data, error } = await supabase
      .from("exercise_history")
      .insert({
        user_id: userId,
        date: exercise.date.toISOString(),
        duration: exercise.duration,
        interval: exercise.interval,
        cones_count: exercise.conesCount,
        color_sequence: exercise.colorSequence,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving exercise:", error);
      return;
    }

    const savedExercise: CompletedExercise = {
      id: data.id,
      date: new Date(data.date),
      duration: data.duration,
      interval: data.interval,
      conesCount: data.cones_count,
      colorSequence: data.color_sequence,
    };

    setExercises((prev) => [savedExercise, ...prev]);
    setCurrentScreen("settings");
  };

  const handleClearHistory = async () => {
    const { error } = await supabase
      .from("exercise_history")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error clearing history:", error);
      return;
    }

    setExercises([]);
  };

  const handleCancelExercise = () => {
    setCurrentScreen("settings");
  };

  const handleBackFromHistory = () => {
    setCurrentScreen("settings");
  };

  return (
    <div className={styles.app}>
      <nav className={styles.navbar}>
        <img src={logo} alt="FootSpeed Logo" className={styles.logoImage} />

        <div className={styles.navButtons}>
          <button
            className={`${styles.navBtn} ${
              currentScreen === "settings" ? styles.active : ""
            }`}
            onClick={() => setCurrentScreen("settings")}
            disabled={currentScreen === "exercise"}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>

          <button
            className={`${styles.navBtn} ${
              currentScreen === "history" ? styles.active : ""
            }`}
            onClick={() => setCurrentScreen("history")}
            disabled={currentScreen === "exercise"}
          >
            <HistoryIcon size={18} />
            <span>History</span>
          </button>

         

          <button
            onClick={() => supabase.auth.signOut()}
            className={styles.navBtn}
            aria-label="Sign out"
          >{userEmail}
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      <main className={styles.content}>
        {currentScreen === "settings" && (
          <Settings onStartExercise={handleStartExercise} />
        )}

        {currentScreen === "exercise" && currentSettings && (
          <Exercise
            settings={currentSettings}
            onComplete={handleCompleteExercise}
            onCancel={handleCancelExercise}
          />
        )}

        {currentScreen === "history" && (
          <History
            exercises={exercises}
            onBack={handleBackFromHistory}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>
    </div>
  );
}