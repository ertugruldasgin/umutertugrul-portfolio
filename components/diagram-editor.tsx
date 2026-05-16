"use client";

import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(() => import("./excalidraw-wrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-subtle font-mono text-sm">
      loading canvas...
    </div>
  ),
});

interface DiagramEditorProps {
  initialData?: any;
  onChange?: (elements: readonly any[], appState: any, files: any) => void;
  viewMode?: boolean;
}

export function DiagramEditor({
  initialData,
  onChange,
  viewMode,
}: DiagramEditorProps) {
  return (
    <div className="h-full w-full">
      <ExcalidrawWrapper
        initialData={initialData}
        onChange={onChange}
        viewMode={viewMode}
      />
    </div>
  );
}
