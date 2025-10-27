
import React, { useEffect, useRef } from 'react';

interface VideoPlayerModalProps {
  url: string;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ url, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-brand-primary rounded-lg shadow-2xl w-full max-w-4xl aspect-video relative">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-brand-highlight text-white rounded-full h-8 w-8 flex items-center justify-center z-10"
          aria-label="Close video player"
        >
          &times;
        </button>
        <video
          className="w-full h-full rounded-lg"
          src={url}
          controls
          autoPlay
          onEnded={onClose}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};
