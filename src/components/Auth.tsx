import { useState } from "react";
import { supabase } from "../lib/supabase";
import logo from "../assets/Logotitle.svg";

type AuthMode = "login" | "signup";

export default function Auth() {
  const params = new URLSearchParams(window.location.search);
  const initialMode = params.get("mode") === "login" ? "login" : "signup";
  const intent = params.get("intent");

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignup = mode === "signup";
  const isBuying = intent === "buy";

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
  };

  const handleSubmit = () => {
    if (isSignup) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const switchMode = () => {
    const nextMode: AuthMode = isSignup ? "login" : "signup";
    setMode(nextMode);

    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set("mode", nextMode);

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${nextParams.toString()}`
    );
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <img src={logo} alt="Footspeed" className="auth-logo" />

        <p className="auth-eyebrow">
          {isSignup ? "CREATE ACCOUNT" : "WELCOME BACK"}
        </p>

        <h1>
          {isSignup
            ? isBuying
              ? "Create your account to unlock Footspeed."
              : "Create your Footspeed account."
            : "Log in to Footspeed."}
        </h1>

        <p>
          {isSignup
            ? "Your account keeps your access connected to your email after purchase."
            : "Access your trainer and continue your footspeed sessions."}
        </p>

        <div className="auth-form">
          <input
            className="auth-input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-primary-btn" onClick={handleSubmit}>
            {isSignup ? "Create account" : "Log in"}
          </button>
        </div>

        <button className="auth-link-btn" onClick={switchMode}>
          {isSignup
            ? "Already have an account? Log in"
            : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}