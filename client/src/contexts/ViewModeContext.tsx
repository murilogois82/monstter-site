import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ViewMode = 'admin' | 'partner';

interface ViewModeContextType {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

const STORAGE_KEY = 'monstter_view_mode';

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar modo do localStorage ao montar
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (savedMode && (savedMode === 'admin' || savedMode === 'partner')) {
      setViewMode(savedMode);
    }
    setIsLoaded(true);
  }, []);

  // Salvar modo no localStorage quando mudar
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, viewMode);
    }
  }, [viewMode, isLoaded]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'admin' ? 'partner' : 'admin'));
  };

  // Não renderizar até carregar do localStorage para evitar flash
  if (!isLoaded) {
    return <div className="min-h-screen bg-black" />;
  }

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
