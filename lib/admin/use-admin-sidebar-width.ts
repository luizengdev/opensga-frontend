"use client";

import {useCallback, useLayoutEffect, useRef, useState} from "react";

import {
  ADMIN_SIDEBAR_DEFAULT_PX,
  ADMIN_SIDEBAR_STORAGE_KEY,
  ADMIN_SIDEBAR_WIDTH_VAR,
  clampAdminSidebarWidth,
} from "@/lib/admin/sidebar-width";

const applySidebarWidth = (width: number) => {
  document.documentElement.style.setProperty(ADMIN_SIDEBAR_WIDTH_VAR, `${width}px`);
};

export const useAdminSidebarWidth = () => {
  const [width, setWidthState] = useState(ADMIN_SIDEBAR_DEFAULT_PX);
  const [isDragging, setIsDragging] = useState(false);
  const widthRef = useRef(width);

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY);
    const parsed = stored ? Number.parseInt(stored, 10) : ADMIN_SIDEBAR_DEFAULT_PX;
    const next = clampAdminSidebarWidth(Number.isFinite(parsed) ? parsed : ADMIN_SIDEBAR_DEFAULT_PX);
    widthRef.current = next;
    setWidthState(next);
    applySidebarWidth(next);
  }, []);

  const setWidth = useCallback((next: number) => {
    const clamped = clampAdminSidebarWidth(next);
    widthRef.current = clamped;
    setWidthState(clamped);
    applySidebarWidth(clamped);
  }, []);

  const persistWidth = useCallback(() => {
    window.localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, String(widthRef.current));
  }, []);

  const resetWidth = useCallback(() => {
    setWidth(ADMIN_SIDEBAR_DEFAULT_PX);
    window.localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, String(ADMIN_SIDEBAR_DEFAULT_PX));
  }, [setWidth]);

  return {
    isDragging,
    persistWidth,
    resetWidth,
    setIsDragging,
    setWidth,
    width,
  };
};
