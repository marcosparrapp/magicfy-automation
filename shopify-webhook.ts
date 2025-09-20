// This file acts as a serverless function or a webhook endpoint.
// It should be deployed to a service that can provide a public URL.
// In Shopify Admin > Settings > Notifications > Webhooks, create a webhook for the
// "Order payment" event and point it to this function's URL.

// IMPORTANT: Your Murphy's API Key should NOT be hardcoded here.
// It must be stored as a secure environment variable. The platform requires it to be named API_KEY.
const MURPHY_API_KEY = process.env.API_KEY;
const API_ENDPOINT = 'http://downloads.murphysmagic.com/api/AddOrder/';

/**
 * Handles the incoming webhook from Shopify.
 * @param req The request object, containing the Shopify order payload.
 */
export default async function handler(req: Request) {
  // Start of the "diary" for this request
  console.log("==================================================");
  console.log(`[DIARY] New request received at: ${new Date().toISOString()}`);

  // 1. Verify the request is a POST request
  if (req.method !== 'POST') {
    console.warn('[DIARY] Request blocked: Not a POST request.');
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. Check for the secret API Key
  if (!MURPHY_API_KEY) {
    console.error('[DIARY] CRITICAL ERROR: Murphy\'s API Key (API_KEY) is not configured in environment variables.');
    return new Response('Server configuration error.', { status: 500 });
  }
  console.log('[DIARY] Murphy\'s API Key is present.');
  
  // A variable to hold the order number for logging in the catch block
  let orderNumber: string | null = null;

  try {
    // 3. Parse the incoming order data from Shopify
    const order = await req.json();
    orderNumber = order.order_number || 'UNKNOWN'; // Store order number for later logs

    console.log(`[DIARY] Received and parsed data for Shopify Order #${orderNumber}.`);

    // Basic validation to ensure it's a valid order payload
    if (!order.customer || !order.line_items) {
      console.warn(`[DIARY] Order #${orderNumber} has an invalid format. Missing customer or line_items.`);
      return new Response('Invalid payload', { status: 400 });
    }

    const { customer, line_items } = order;
    console.log(`[DIARY] Order #${orderNumber} is for customer: ${customer.email}.`);
    
    // 4. Extract Product IDs from SKUs
    // The SKU in Shopify MUST be the Murphy's Magic ProductID.
    const productIds = line_items
      .map((item: { sku: string; title: string }) => {
        console.log(`[DIARY] Checking item: "${item.title}" with SKU: ${item.sku || 'No SKU'}`);
        return item.sku;
      })
      .filter(Boolean) // Remove any items that don't have a SKU
      .join(',');

    if (!productIds) {
      console.log(`[DIARY] Order #${orderNumber} has no items with a SKU. Nothing to send to Murphy's. Process finished.`);
      return new Response('No products to process.', { status: 200 });
    }

    console.log(`[DIARY] Found ProductIDs (from SKUs) to send for Order #${orderNumber}: [${productIds}]`);

    // 5. Prepare the data for Murphy's Magic API
    const formData = new FormData();
    formData.append('APIKey', MURPHY_API_KEY);
    formData.append('FirstName', customer.first_name || 'Customer');
    formData.append('LastName', customer.last_name || ' '); // Use a space if no last name
    formData.append('Email', customer.email);
    formData.append('ProductIds', productIds);
    
    console.log(`[DIARY] Calling Murphy's Magic API for Order #${orderNumber}...`);

    // 6. Call the Murphy's Magic API to place the order
    const murphyResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    const responseText = await murphyResponse.text(); // Get text to log it, regardless of status
    console.log(`[DIARY] Murphy's API responded with status ${murphyResponse.status}. Response body: ${responseText}`);

    if (!murphyResponse.ok) {
        // This will be caught by the catch block below
        throw new Error(`Murphy's API Error: Status ${murphyResponse.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText); // Parse the text we already fetched

    if (result.error) {
        // This will be caught by the catch block below
        throw new Error(`Murphy's API returned an error in the JSON: ${result.error}`);
    }

    // 7. Handle the response and send a success status back to Shopify
    if (result.message === 'success') {
        console.log(`[DIARY] SUCCESS: Order #${orderNumber} for ${customer.email} was processed successfully by Murphy's.`);
        console.log("==================================================");
        return new Response('Webhook processed successfully.', { status: 200 });
    } else {
        // This will be caught by the catch block below
        throw new Error(`Unknown success response from Murphy's API: ${responseText}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error(`[DIARY] FAILED to process Shopify webhook for Order #${orderNumber || 'N/A'}: ${errorMessage}`);
    console.log("==================================================");
    // Return a 500 status to let Shopify know it failed and it might retry
    return new Response(`Webhook processing failed: ${errorMessage}`, { status: 500 });
  }
}
