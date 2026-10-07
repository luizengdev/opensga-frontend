"use client";

import {useEffect, useRef} from "react";

import {
  ADMIN_SIDEBAR_MAX_PX,
  ADMIN_SIDEBAR_MIN_PX,
} from "@/lib/admin/sidebar-width";

interface AdminSidebarResizeHandleProps {
  onDrag: (width: number) => void;
  onDragEnd: () => void;
  onDraggingChange: (isDragging: boolean) => void;
  onReset: () => void;
  width: number;
}

export const AdminSidebarResizeHandle = ({
  onDrag,
  onDragEnd,
  onDraggingChange,
  onReset,
  width,
}: AdminSidebarResizeHandleProps) => {
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current) {
        return;
      }

      onDrag(event.clientX);
    };

    const onUp = () => {
      if (!draggingRef.current) {
        return;
      }

      draggingRef.current = false;
      onDraggingChange(false);
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
      onDragEnd();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onDrag, onDragEnd, onDraggingChange]);

  return (
    <div
      aria-label="Redimensionar menu lateral"
      aria-orientation="vertical"
      aria-valuemax={ADMIN_SIDEBAR_MAX_PX}
      aria-valuemin={ADMIN_SIDEBAR_MIN_PX}
      aria-valuenow={width}
      className="group absolute top-0 right-0 z-50 hidden h-full w-1.5 cursor-col-resize touch-none hover:bg-sidebar-ring/20 md:block"
      onDoubleClick={onReset}
      onPointerDown={(event) => {
        event.preventDefault();
        draggingRef.current = true;
        onDraggingChange(true);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      }}
      role="separator"
      title="Arraste para redimensionar. Clique duplo restaura o tamanho padrão."
    >
      <span className="absolute inset-y-0 right-0 w-px bg-sidebar-border transition-[width,background-color] group-hover:w-0.5 group-hover:bg-sidebar-ring" />
    </div>
  );
};
