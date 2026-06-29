import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Mock users — replace with real API calls later
const MOCK_USERS = [
  { id: "NEX-2026-001", email: "user@nexis.com",      password: "pass123",   role: "user"      },
  { id: "NEX-2026-002", email: "admin@nexis.com",     password: "admin123",  role: "admin"     },
  { id: "NEX-2026-003", email: "treasurer@nexis.com", password: "tres123",   role: "treasurer" },
];

const LOCKOUT_LIMIT    = 5;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour in ms

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil,    setLockedUntil]    = useState(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

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

  const login = (email, password) => {
    if (isLocked) {
      return { success: false, message: "Account locked. Try again later." };
    }

    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      setUser(found);
      setFailedAttempts(0);
      setLockedUntil(null);
      return { success: true, role: found.role };
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

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, failedAttempts, isLocked, lockoutRemaining }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}