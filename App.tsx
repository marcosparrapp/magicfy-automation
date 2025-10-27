
import React, { useState, useEffect } from 'react';
import { AdminPortal } from './components/AdminPortal';
import { CustomerPortal } from './components/CustomerPortal';
import { Header } from './components/Header';
import { AppContextProvider } from './context/AppContext';

type View = 'customer' | 'admin';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [view, setView] = useState<View>('customer');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('murphyApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('murphyApiKey', key);
  };

  return (
    <AppContextProvider>
      <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary font-sans">
        <Header 
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          view={view}
          onViewChange={setView}
        />
        <main className="container mx-auto p-4 md:p-8">
          {view === 'admin' ? <AdminPortal apiKey={apiKey} /> : <CustomerPortal apiKey={apiKey} />}
        </main>
      </div>
    </AppContextProvider>
  );
};

export default App;
