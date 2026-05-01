import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import MainApp from "./components/Main";
import Auth from "./components/Auth";
import { supabase } from "./lib/supabase";
import "./App.css";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const isPaymentSuccess =
    new URLSearchParams(window.location.search).get("payment") === "success";

  async function checkPayment(userId: string) {
    setCheckingPayment(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("has_paid")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile error:", error);
      setHasPaid(false);
    } else {
      setHasPaid(data?.has_paid ?? false);
    }

    setCheckingPayment(false);

    return data?.has_paid ?? false;
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);

      if (data.session?.user) {
        const paid = await checkPayment(data.session.user.id);

        if (isPaymentSuccess && paid) {
  setShowWelcome(true);
  window.history.replaceState({}, "", window.location.pathname);
}
      }

      setLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session?.user) {
        checkPayment(session.user.id);
      } else {
        setHasPaid(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading || checkingPayment) {
    return (
      <div className="auth-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (isPaymentSuccess && !hasPaid) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>Payment successful</h1>
          <p>We’re unlocking your access. This can take a few seconds.</p>

          <button
            className="auth-primary-btn"
            onClick={() => checkPayment(session.user.id)}
          >
            Refresh access
          </button>
        </div>
      </div>
    );
  }

  if (!hasPaid) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>You’re one step away</h1>

        <p>
          Your Footspeed account is ready. Complete your one-time payment to
          unlock the full trainer.
        </p>

        <ul className="unlock-list">
          <li>All cone colors</li>
          <li>Custom duration and intervals</li>
          <li>Exercise history</li>
          <li>Voice calls included</li>
        </ul>

        <button
          className="auth-primary-btn"
          onClick={() => {
            window.location.href = "https://buy.stripe.com/test_28E00i7jSeUr3yWaRdgUM00";
          }}
        >
          Continue to payment
        </button>

        <button
          className="auth-secondary-btn"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

  return (
  <>
    {showWelcome && (
      <div className="welcome-overlay">
        <div className="welcome-dialog">
          <h1>Welcome to Footspeed</h1>
          <p>Your full access is now unlocked. Let’s train.</p>

          <button
            className="auth-primary-btn"
            onClick={() => setShowWelcome(false)}
          >
            Start training
          </button>
        </div>
      </div>
    )}

    <MainApp
  userEmail={session.user.email ?? ""}
  userId={session.user.id}
/>

  </>
);
}

export default App;