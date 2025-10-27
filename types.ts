
export interface Download {
  ID: number;
  Name: string;
  CreatorName: string;
  Price: number;
  Type: 'Video' | 'eBook' | 'Mixed';
  LiveStreamStartTime: string | null;
  NumberOfVideos: number;
}

export interface DownloadStatus {
  PercentComplete: number;
  RequestTime: string;
  Status: 'queued' | 'watermarking' | 'ready' | 'notqueued' | 'error';
  DownloadLink: string;
  error?: string; // Custom property to handle API errors
}
