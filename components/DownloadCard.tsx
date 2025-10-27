import React, { useState, useEffect, useCallback } from 'react';
import type { Download, DownloadStatus } from '../types';
import { getVideoStreamUrl, requestDownloadLink, getDownloadStatus } from '../services/murphyApi';
import { Loader } from './Loader';
import { PlayIcon, DownloadIcon, ClockIcon, CheckCircleIcon, ExclamationIcon } from './icons';
import { useAppContext } from '../context/AppContext';

interface DownloadCardProps {
  download: Download;
  apiKey: string;
  email: string;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({ download, apiKey, email }) => {
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadStatus | null>(null);
  const { playVideo } = useAppContext();

  const handleStream = async () => {
    setIsLoadingStream(true);
    const result = await getVideoStreamUrl(apiKey, email, download.ID);
    setIsLoadingStream(false);
    if (typeof result === 'string') {
      playVideo(result);
    } else {
      alert(`Error getting stream URL: ${result.error}`);
    }
  };

  const handleDownloadRequest = async () => {
    setDownloadState({ Status: 'queued', PercentComplete: 0, RequestTime: '', DownloadLink: '' });
    const result = await requestDownloadLink(apiKey, email, download.ID);
    setDownloadState(result);
  };

  const pollDownloadStatus = useCallback(async () => {
    const result = await getDownloadStatus(apiKey, email, download.ID);
    setDownloadState(result);
  }, [apiKey, email, download.ID]);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> to correctly infer the timer ID type in a browser environment.
    let interval: ReturnType<typeof setInterval> | null = null;
    if (downloadState?.Status === 'queued' || downloadState?.Status === 'watermarking') {
      interval = setInterval(pollDownloadStatus, 5000); // Poll every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [downloadState, pollDownloadStatus]);
  
  const renderDownloadButton = () => {
    if (!downloadState || downloadState.Status === 'notqueued') {
      return (
         <button onClick={handleDownloadRequest} className="action-button bg-blue-600 hover:bg-blue-500">
            <DownloadIcon className="w-5 h-5" />
            <span>Download</span>
        </button>
      )
    }
    switch (downloadState.Status) {
        case 'queued':
            return <div className="status-display bg-yellow-500/20 text-yellow-300"><ClockIcon className="w-5 h-5 animate-spin" /><span>Queued...</span></div>
        case 'watermarking':
            return <div className="status-display bg-purple-500/20 text-purple-300"><ClockIcon className="w-5 h-5 animate-spin" /><span>Watermarking ({downloadState.PercentComplete}%)</span></div>
        case 'ready':
            return <a href={downloadState.DownloadLink} target="_blank" rel="noopener noreferrer" className="action-button bg-green-600 hover:bg-green-500"><CheckCircleIcon className="w-5 h-5"/><span>Ready! Click to Save</span></a>
        case 'error':
             return <div className="status-display bg-red-500/20 text-red-300"><ExclamationIcon className="w-5 h-5" /><span>Error</span></div>
        default:
            return <button onClick={handleDownloadRequest} className="action-button bg-blue-600 hover:bg-blue-500"><DownloadIcon className="w-5 h-5"/><span>Download</span></button>
    }
  }

  return (
    <div className="bg-brand-accent rounded-lg p-4 flex flex-col justify-between shadow-lg transition-transform hover:scale-105">
      <div>
        <h3 className="font-bold text-lg text-white">{download.Name}</h3>
        <p className="text-sm text-gray-400 mb-4">{download.CreatorName}</p>
      </div>
      <div className="space-y-2">
        {download.Type !== 'eBook' && (
          <button onClick={handleStream} disabled={isLoadingStream} className="action-button bg-brand-highlight hover:bg-red-500">
            {isLoadingStream ? <Loader /> : <><PlayIcon className="w-5 h-5" /><span>Stream</span></>}
          </button>
        )}
         {renderDownloadButton()}
      </div>
    </div>
  );
};


// Add shared styles for action buttons and status displays
const globalStyles = `
  .action-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-weight: 600;
    color: white;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
    disabled:opacity-50 disabled:cursor-not-allowed
  }
  .status-display {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-weight: 600;
    border-radius: 0.375rem;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);