
// IMPORTANT: The Murphy's Magic API may not support Cross-Origin Resource Sharing (CORS).
// If you see network errors in your browser console, you MUST set up a proxy server.
// This server will receive requests from your frontend, forward them to the Murphy's API,
// and then return the response back to your frontend.
//
// Example: Change API_BASE_URL to 'https://your-proxy-server.com/api/'
// Your proxy would then forward requests to 'http://downloads.murphysmagic.com/api/'

export const API_BASE_URL = 'http://downloads.murphysmagic.com/api';

export const API_ENDPOINTS = {
    GET_CUSTOMER: `${API_BASE_URL}/GetCustomer/`,
    ADD_ORDER: `${API_BASE_URL}/AddOrder/`,
    GET_DOWNLOADS: `${API_BASE_URL}/GetDownloadsForCustomer/`,
    GET_DOWNLOAD_DETAILS: `${API_BASE_URL}/GetDownload/`,
    GET_VIDEO_STREAM_URL: `${API_BASE_URL}/GetVideoStreamURLv2/`,
    GET_DOWNLOAD_LINK: `${API_BASE_URL}/GetDownloadLinkv2/`,
    GET_DOWNLOAD_STATUS: `${API_BASE_URL}/GetDownloadLinkStatus/`,
};
