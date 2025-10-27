import { Product } from "../types";

// The entire logic for SOAP requests and credentials has been moved to the backend.
// The frontend now makes clean, simple fetch calls to its own API endpoints,
// which will be handled by Vercel Serverless Functions.

const handleApiResponse = async (response: Response, entityName: string): Promise<Product[]> => {
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching ${entityName} from backend:`, errorText);
        // Try to parse JSON for a more specific message
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `Failed to fetch ${entityName}. Server responded with ${response.status}.`);
        } catch (e) {
            throw new Error(`Failed to fetch ${entityName}. Server responded with ${response.status}.`);
        }
    }
    const data = await response.json();
    return data.products || [];
}

/**
 * Fetches newly added products by calling our secure Vercel backend endpoint.
 */
export const getNewProducts = async (): Promise<Product[]> => {
    const response = await fetch('/api/murphys/new-products');
    return await handleApiResponse(response, 'new products');
};

/**
 * Fetches products with recent price changes by calling our secure Vercel backend endpoint.
 */
export const getPriceUpdates = async (): Promise<Product[]> => {
    // NOTE: The backend for this doesn't exist yet, but we prepare the frontend call.
    // When created, it will live at /api/murphys/price-updates
    console.warn("getPriceUpdates is a placeholder and will not fetch real data yet.");
    // const response = await fetch('/api/murphys/price-updates');
    // return await handleApiResponse(response, 'price updates');
    return Promise.resolve([]); // Returning empty array for now
};

/**
 * Fetches products with recent stock level changes by calling our secure Vercel backend endpoint.
 */
export const getStockUpdates = async (): Promise<Product[]> => {
    // NOTE: The backend for this doesn't exist yet, but we prepare the frontend call.
    // When created, it will live at /api/murphys/stock-updates
    console.warn("getStockUpdates is a placeholder and will not fetch real data yet.");
    // const response = await fetch('/api/murphys/stock-updates');
    // return await handleApiResponse(response, 'stock updates');
    return Promise.resolve([]); // Returning empty array for now
};