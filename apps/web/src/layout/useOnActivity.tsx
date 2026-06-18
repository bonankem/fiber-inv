import { message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLogout } from "#/modules/auth/utils";

// The amount of time left needs to be tracked in local storage so that it is shared across tabs.
// Without this, having multiple tabs open would cause the session to timeout in the other tabs
// even though the open tab is active
const key = "lastActivity";

const envTimeout = import.meta.env.VITE_SESSION_TIMEOUT;
const max = (Number(envTimeout) || 15) * 60_000;

export function useOnActivity() {
  const [timeLeft, setTimeLeft] = useState(max);

  const interval = useMemo(() => {
    // check every second when we are almost out of time
    // but use a larger interval otherwise
    return timeLeft < 60000 ? 1000 : 20000;
  }, [timeLeft]);

  const logout = useLogout();
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const last = Number(localStorage.getItem(key));
      if (!last) {
        // on the first iteration, set initial value and return
        return localStorage.setItem(key, now.toString());
      }
      const past = now - last;
      const left = Math.max(0, max - past);
      setTimeLeft(left);
      if (left <= 0) {
        message.error("Session ended due to inactivity");
        logout.call();
        localStorage.removeItem(key);
      }
    };
    const i = setInterval(check, interval);
    return () => clearInterval(i);
  }, [interval, logout.call]);

  const onActivity = useCallback(() => {
    localStorage.setItem(key, Date.now().toString());
    setTimeLeft(max);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.addEventListener("click", onActivity);
    body.addEventListener("keyup", onActivity);
    return () => {
      body.removeEventListener("click", onActivity);
      body.removeEventListener("keyup", onActivity);
    };
  }, [onActivity]);

  return { timeLeft };
}
