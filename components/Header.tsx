
import React from 'react';
import { MagicWandIcon } from './icons';

interface HeaderProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  view: 'customer' | 'admin';
  onViewChange: (view: 'customer' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ apiKey, onApiKeyChange, view, onViewChange }) => {
  return (
    <header className="bg-brand-secondary/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
      <div className="container mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MagicWandIcon className="w-8 h-8 text-brand-highlight" />
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
            Murphy's Magic Manager
          </h1>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-64">
             <input
                type="password"
                placeholder="Enter Murphy's API Key"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="w-full px-3 py-2 bg-brand-accent border border-brand-accent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-highlight transition-all"
              />
          </div>
          <div className="flex bg-brand-accent p-1 rounded-md">
            <button
              onClick={() => onViewChange('customer')}
              className={`px-4 py-1 text-sm font-semibold rounded ${view === 'customer' ? 'bg-brand-highlight text-white' : 'text-gray-300 hover:bg-brand-secondary'
                } transition-colors`}
            >
              Customer
            </button>
            <button
              onClick={() => onViewChange('admin')}
              className={`px-4 py-1 text-sm font-semibold rounded ${view === 'admin' ? 'bg-brand-highlight text-white' : 'text-gray-300 hover:bg-brand-secondary'
                } transition-colors`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
