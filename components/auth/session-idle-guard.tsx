"use client";

import dayjs from "dayjs";
import {useEffect, useRef} from "react";

import {useRenovarSessao} from "@/lib/api/rc-generated";
import {clearAuthTokenCookie} from "@/lib/auth/clear-auth-cookie";
import {SESSION_REFRESH_INTERVAL_MS} from "@/lib/auth/session-idle";
import {setAuthTokenCookie} from "@/lib/auth/set-auth-cookie";

interface SessionIdleGuardProps {
  idleMs: number;
  loginPath: string;
}

export const SessionIdleGuard = ({idleMs, loginPath}: SessionIdleGuardProps) => {
  const {mutate: renovar} = useRenovarSessao();
  const lastActivityRef = useRef(dayjs());
  const lastRefreshRef = useRef(dayjs());
  const loggingOutRef = useRef(false);

  useEffect(() => {
    const markActivity = () => {
      if (loggingOutRef.current) {
        return;
      }

      lastActivityRef.current = dayjs();

      if (dayjs().diff(lastRefreshRef.current, "millisecond") < SESSION_REFRESH_INTERVAL_MS) {
        return;
      }

      lastRefreshRef.current = dayjs();
      renovar(undefined, {
        onSuccess: (result) => {
          void setAuthTokenCookie(result.token);
        },
      });
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"] as const;

    events.forEach((event) => {
      window.addEventListener(event, markActivity, {passive: true});
    });

    const intervalId = window.setInterval(() => {
      if (loggingOutRef.current) {
        return;
      }

      if (dayjs().diff(lastActivityRef.current, "millisecond") < idleMs) {
        return;
      }

      loggingOutRef.current = true;
      void clearAuthTokenCookie().then(() => {
        window.location.assign(loginPath);
      });
    }, 1000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, markActivity);
      });
      window.clearInterval(intervalId);
    };
  }, [idleMs, loginPath, renovar]);

  return null;
};
