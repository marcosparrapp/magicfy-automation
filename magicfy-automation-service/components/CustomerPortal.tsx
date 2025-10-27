
import React, { useState, useEffect } from 'react';
import type { Download } from '../types';
import * as murphyApi from '../services/murphyApi';
import { Loader } from './Loader';
import { DownloadCard } from './DownloadCard';
import { VideoPlayerModal } from './VideoPlayerModal';
import { useAppContext } from '../context/AppContext';

interface CustomerPortalProps {
  apiKey: string;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ apiKey }) => {
  const [email, setEmail] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { playingVideoUrl, closeVideo } = useAppContext();

  useEffect(() => {
    // Clear downloads if the API key changes
    setDownloads([]);
    setSearchedEmail('');
    setError(null);
  }, [apiKey]);

  const fetchDownloads = async () => {
    if (!apiKey) {
        setError('Please provide a valid API Key in the header.');
        return;
    }
    if (!email) {
        setError('Please enter a customer email address.');
        return;
    }

    setLoading(true);
    setError(null);
    setDownloads([]);

    const productIdsResponse = await murphyApi.getDownloadsForCustomer(apiKey, email);

    if ('error' in productIdsResponse) {
        setError(productIdsResponse.error);
        setLoading(false);
        return;
    }

    if (!Array.isArray(productIdsResponse) || productIdsResponse.length === 0) {
        setError('No downloads found for this email address.');
        setLoading(false);
        return;
    }
    
    setSearchedEmail(email);

    const downloadDetailsPromises = productIdsResponse.map(id => murphyApi.getDownloadDetails(apiKey, id));
    const resolvedDownloads = await Promise.all(downloadDetailsPromises);
    
    // Filter out any potential errors from individual detail fetches
    const successfulDownloads = resolvedDownloads.filter(d => d && !('error' in d));
    
    setDownloads(successfulDownloads);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDownloads();
  };
  
  const handleReset = () => {
    setEmail('');
    setSearchedEmail('');
    setDownloads([]);
    setError(null);
  }

  return (
    <>
      <div className="bg-brand-secondary p-6 md:p-8 rounded-lg shadow-2xl max-w-4xl mx-auto">
        {!searchedEmail ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-brand-highlight">Customer Download Portal</h2>
            <p className="text-center text-gray-400 mb-6 -mt-4">Enter customer's email to view their purchased downloads.</p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field flex-grow"
              />
              <button type="submit" disabled={loading} className="px-6 py-3 bg-brand-highlight text-white font-bold rounded-md hover:bg-red-500 transition-colors disabled:bg-gray-500 flex items-center justify-center">
                {loading ? <Loader /> : 'Find Downloads'}
              </button>
            </form>
          </>
        ) : (
          <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-highlight">Downloads for <span className="text-white">{searchedEmail}</span></h2>
                <button onClick={handleReset} className="text-sm text-gray-400 hover:text-white">Search again</button>
             </div>
              {loading && <div className="flex justify-center p-8"><Loader /></div>}
              {!loading && downloads.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {downloads.map((download) => (
                    <DownloadCard key={download.ID} download={download} apiKey={apiKey} email={searchedEmail} />
                  ))}
                </div>
              )}
          </div>
        )}
        {error && <p className="mt-4 text-center text-red-400">{error}</p>}
      </div>
      {playingVideoUrl && <VideoPlayerModal url={playingVideoUrl} onClose={closeVideo} />}
    </>
  );
};
