import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'admin' | 'partner';

interface ViewModeContextType {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('admin');

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'admin' ? 'partner' : 'admin'));
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, toggleViewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode deve ser usado dentro de ViewModeProvider');
  }
  return context;
}
