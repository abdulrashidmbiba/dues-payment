import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { getCurrentProfile } from "../lib/auth";

const AuthContext = createContext(null);

const LOCKOUT_LIMIT    = 5;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour in ms

export function AuthProvider({ children }) {
  const [user,            setUser]            = useState(null); // merged profile: id, email, member_id, role, full_name...
  const [loading,         setLoading]         = useState(true);
  const [failedAttempts,  setFailedAttempts]  = useState(0);
  const [lockedUntil,     setLockedUntil]     = useState(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // On mount: restore session if one exists, and stay in sync with auth changes.
  useEffect(() => {
    let active = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getCurrentProfile();
        if (active) setUser(profile);
      }
      if (active) setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const profile = await getCurrentProfile();
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Countdown timer while locked
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 60000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setFailedAttempts(0);
        setLockoutRemaining(0);
      } else {
        setLockoutRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const login = async (email, password) => {
    if (isLocked) {
      return { success: false, message: "Account locked. Try again later." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data.user) {
      const profile = await getCurrentProfile();
      setUser(profile);
      setFailedAttempts(0);
      setLockedUntil(null);
      return { success: true, role: profile?.role ?? "member" };
    }

    // Don't count non-credential failures (unconfirmed email, rate limits, etc.)
    // against the lockout, and don't hide them behind a generic wrong-password
    // message — surface what actually went wrong.
    if (error) {
      const msg = (error.message || "").toLowerCase();

      if (msg.includes("email not confirmed")) {
        return {
          success: false,
          message: "This account's email hasn't been confirmed. Ask an admin to disable email confirmation in Supabase, or check your inbox for a confirmation link.",
        };
      }
      if (error.status === 429 || msg.includes("rate limit")) {
        return {
          success: false,
          message: "Too many requests right now. Wait a minute and try again.",
        };
      }
      if (!msg.includes("invalid login credentials")) {
        // Anything unexpected — show the real reason instead of guessing.
        return { success: false, message: error.message || "Something went wrong signing in." };
      }
    }

    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    if (newAttempts >= LOCKOUT_LIMIT) {
      const until = Date.now() + LOCKOUT_DURATION;
      setLockedUntil(until);
      setLockoutRemaining(60);
      return { success: false, message: "Too many attempts. Account locked for 1 hour." };
    }

    return {
      success: false,
      message: `Incorrect email or password. ${LOCKOUT_LIMIT - newAttempts} attempt${LOCKOUT_LIMIT - newAttempts !== 1 ? "s" : ""} remaining.`,
    };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, failedAttempts, isLocked, lockoutRemaining }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}