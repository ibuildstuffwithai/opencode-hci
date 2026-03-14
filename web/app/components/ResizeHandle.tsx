"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
  className?: string;
  /** Which side the handle is on relative to the panel it resizes */
  side?: "right" | "left" | "bottom" | "top";
}

export function ResizeHandle({
  direction,
  onResize,
  onResizeEnd,
  className = "",
  side = "right",
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      lastPos.current = direction === "horizontal" ? e.clientX : e.clientY;
    },
    [direction]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const current = direction === "horizontal" ? e.clientX : e.clientY;
      let delta = current - lastPos.current;
      // Invert delta for left/top side handles
      if (side === "left" || side === "top") delta = -delta;
      lastPos.current = current;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEnd?.();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    // Prevent text selection while dragging
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      direction === "horizontal" ? "col-resize" : "row-resize";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, direction, side, onResize, onResizeEnd]);

  const isH = direction === "horizontal";

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        ${isH ? "w-[5px] cursor-col-resize" : "h-[5px] cursor-row-resize"}
        ${isH ? "hover:w-[5px]" : "hover:h-[5px]"}
        shrink-0 relative group transition-colors
        ${isDragging ? "bg-accent/40" : "bg-transparent hover:bg-accent/20"}
        ${className}
      `}
      style={{ zIndex: 10 }}
    >
      {/* Visible line indicator */}
      <div
        className={`
          absolute 
          ${isH ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-8 rounded-full" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-8 rounded-full"}
          transition-opacity
          ${isDragging ? "bg-accent opacity-100" : "bg-muted/30 opacity-0 group-hover:opacity-100"}
        `}
      />
    </div>
  );
}
