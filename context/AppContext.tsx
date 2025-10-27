
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
  playingVideoUrl: string | null;
  playVideo: (url: string) => void;
  closeVideo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  const playVideo = (url: string) => {
    setPlayingVideoUrl(url);
  };

  const closeVideo = () => {
    setPlayingVideoUrl(null);
  };

  return (
    <AppContext.Provider value={{ playingVideoUrl, playVideo, closeVideo }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
