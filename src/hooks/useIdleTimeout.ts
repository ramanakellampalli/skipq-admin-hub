import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";

const IDLE_MS = 15 * 60 * 1000;  // 15 minutes
const WARN_MS =  2 * 60 * 1000;  // warn at 13 minutes (2 min before logout)

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

export function useIdleTimeout() {
  const logout = useAuth((s) => s.logout);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const lastActivity = useRef(Date.now());
  const warningActive = useRef(false);  // ref-copy so event handlers don't go stale

  const resetActivity = useCallback(() => {
    // Once the warning is showing, ignore passive activity — only explicit extend() resets
    if (warningActive.current) return;
    lastActivity.current = Date.now();
  }, []);

  const extend = useCallback(() => {
    lastActivity.current = Date.now();
    warningActive.current = false;
    setShowWarning(false);
    setSecondsLeft(0);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/login";
  }, [logout]);

  useEffect(() => {
    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, resetActivity, { passive: true })
    );

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity.current;

      if (elapsed >= IDLE_MS) {
        handleLogout();
        return;
      }

      if (elapsed >= IDLE_MS - WARN_MS) {
        warningActive.current = true;
        setShowWarning(true);
        setSecondsLeft(Math.ceil((IDLE_MS - elapsed) / 1000));
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, resetActivity));
      clearInterval(interval);
    };
  }, [resetActivity, handleLogout]);

  return { showWarning, secondsLeft, extend, logout: handleLogout };
}
