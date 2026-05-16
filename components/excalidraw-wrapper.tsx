"use client";

import { useRef, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface ExcalidrawWrapperProps {
  initialData?: {
    elements?: any[];
    appState?: Record<string, any>;
    files?: Record<string, any>;
  };
  onChange?: (elements: readonly any[], appState: any, files: any) => void;
  viewMode?: boolean;
}

export default function ExcalidrawWrapper({
  initialData,
  onChange,
  viewMode = false,
}: ExcalidrawWrapperProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      onChange?.(elements, appState, files);
    },
    [onChange],
  );

  return (
    <Excalidraw
      excalidrawAPI={(api) => (apiRef.current = api)}
      initialData={initialData}
      onChange={handleChange}
      theme="dark"
      viewModeEnabled={viewMode}
      UIOptions={{
        canvasActions: {
          loadScene: false,
        },
      }}
    />
  );
}
