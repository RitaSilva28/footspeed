import { useState } from "react";
import { supabase } from "../lib/supabase";
import logo from "../assets/Logotitle.svg";
import Footer from "./Footer";

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

    if (nextMode === "signup") {
      nextParams.set("intent", "buy");
    } else {
      nextParams.delete("intent");
    }

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
          {isSignup ? "GET FULL ACCESS" : "WELCOME BACK"}
        </p>

        <h1>
          {isSignup
            ? "Create your account to unlock Footspeed."
            : "Log in to your Footspeed account."}
        </h1>

       <p>
  {isSignup && isBuying
    ? "Create your account first. Your purchase will be connected to this email."
    : "Log in to access your trainer and continue your sessions."}
</p>

{isSignup && (
  <div className="auth-stepper-horizontal">
    <div className="auth-step-horizontal active">
      <div className="auth-step-marker">1</div>
      <div>
        <span>Step 1</span>
        <p>Create account</p>
        <small>In progress</small>
      </div>
    </div>

    <div className="auth-step-line" />

    <div className="auth-step-horizontal">
      <div className="auth-step-marker">2</div>
      <div>
        <span>Step 2</span>
        <p>Payment</p>
        <small>Next</small>
      </div>
    </div>

    <div className="auth-step-line" />

    <div className="auth-step-horizontal">
      <div className="auth-step-marker">3</div>
      <div>
        <span>Step 3</span>
        <p>Start training</p>
      </div>
    </div>
  </div>
)}

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
            {isSignup ? "Create account and continue" : "Log in"}
          </button>
        </div>

        <button className="auth-link-btn" onClick={switchMode}>
          {isSignup
            ? "Already have an account? Log in"
            : "New here? Create account"}
        </button>
      </div>
      <Footer />
    </div>
  );
}