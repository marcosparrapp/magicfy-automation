// This file acts as a serverless function or a webhook endpoint.
// It should be deployed to a service that can provide a public URL.
// In Shopify Admin > Settings > Notifications > Webhooks, create a webhook for the
// "Order payment" event and point it to this function's URL.

// IMPORTANT: Your Murphy's API Key should NOT be hardcoded here.
// It must be stored as a secure environment variable. The platform requires it to be named API_KEY.
const MURPHY_API_KEY = process.env.API_KEY;
// This is the correct endpoint for the "Download Center API" as per the first PDF.
const API_ENDPOINT = 'http://downloads.murphysmagic.com/api/AddOrder/';

/**
 * Handles the incoming webhook from Shopify.
 * @param req The request object from Vercel's Node.js runtime.
 * @param res The response object from Vercel's Node.js runtime.
 */
export default async function handler(req: any, res: any) {
  // Start of the "diary" for this request
  console.log("==================================================");
  console.log(`[DIARY] New request received at: ${new Date().toISOString()}`);

  // 1. Verify the request is a POST request
  if (req.method !== 'POST') {
    console.warn('[DIARY] Request blocked: Not a POST request.');
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  // 2. Check for the secret API Key
  if (!MURPHY_API_KEY) {
    console.error('[DIARY] CRITICAL ERROR: Murphy\'s API Key (API_KEY) is not configured in environment variables.');
    return res.status(500).send('Server configuration error.');
  }
  console.log('[DIARY] Murphy\'s API Key is present.');
  
  let orderNumber: string | null = null;

  try {
    // 3. Get the pre-parsed JSON body from the request
    const order = req.body;
    orderNumber = order.order_number || 'UNKNOWN';

    console.log(`[DIARY] Received and parsed data for Shopify Order #${orderNumber}.`);

    if (!order.customer || !order.line_items) {
      console.warn(`[DIARY] Order #${orderNumber} has an invalid format. Missing customer or line_items.`);
      return res.status(400).send('Invalid payload');
    }

    const { customer, line_items } = order;
    console.log(`[DIARY] Order #${orderNumber} is for customer: ${customer.email}.`);
    
    // 4. Extract Product IDs from SKUs
    const productIds = line_items
      .map((item: { sku: string; title: string }) => {
        console.log(`[DIARY] Checking item: "${item.title}" with SKU: ${item.sku || 'No SKU'}`);
        return item.sku;
      })
      .filter(Boolean) // This removes any null/empty SKUs
      .join(',');

    if (!productIds) {
      console.log(`[DIARY] Order #${orderNumber} has no items with a SKU. Nothing to send to Murphy's. Process finished.`);
      return res.status(200).send('No products to process.');
    }

    console.log(`[DIARY] Found ProductIDs (from SKUs) to send for Order #${orderNumber}: [${productIds}]`);

    // 5. Prepare the data for Murphy's Magic API using URLSearchParams
    // This correctly formats the data as 'application/x-www-form-urlencoded'
    const bodyParams = new URLSearchParams({
      APIKey: MURPHY_API_KEY,
      FirstName: customer.first_name || 'Valued',
      LastName: customer.last_name || 'Customer',
      Email: customer.email,
      ProductIds: productIds,
    });
    
    console.log(`[DIARY] Calling Murphy's Magic API for Order #${orderNumber}...`);

    // 6. Call the Murphy's Magic API with the correct headers and body
    const murphyResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    const responseText = await murphyResponse.text();
    console.log(`[DIARY] Murphy's API responded with status ${murphyResponse.status}. Response body: ${responseText}`);

    if (!murphyResponse.ok) {
        throw new Error(`Murphy's API Error: Status ${murphyResponse.status} - ${responseText}`);
    }

    // Try to parse the response as JSON, but handle cases where it might not be
    let result;
    try {
        result = JSON.parse(responseText);
    } catch (parseError) {
        throw new Error(`Failed to parse JSON response from Murphy's: ${responseText}`);
    }

    // 7. Handle the response from Murphy's
    // If the API returned a JSON object with an 'error' key, it's a failure.
    if (result.error) {
        throw new Error(`Murphy's API returned a business logic error: ${result.error}`);
    }
    
    // As per documentation, a success response is {"message":"success"}
    if (result.message !== 'success') {
      console.warn(`[DIARY] Unknown success response from Murphy's API: ${responseText}`);
    }

    console.log(`[DIARY] SUCCESS: Order #${orderNumber} for ${customer.email} was processed successfully by Murphy's.`);
    console.log("==================================================");
    return res.status(200).send('Webhook processed successfully.');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error(`[DIARY] FAILED to process Shopify webhook for Order #${orderNumber || 'N/A'}: ${errorMessage}`);
    console.log("==================================================");
    return res.status(500).send(`Webhook processing failed: ${errorMessage}`);
  }
}
