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
  // 1. Verify the request is a POST request
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. Check for the secret API Key
  if (!MURPHY_API_KEY) {
    console.error('CRITICAL: API_KEY environment variable is not set.');
    return new Response('Server configuration error.', { status: 500 });
  }
  
  try {
    // 3. Parse the incoming order data from Shopify
    const order = await req.json();

    // Basic validation to ensure it's a valid order payload
    if (!order.customer || !order.line_items) {
      console.warn('Received webhook with invalid payload format.');
      return new Response('Invalid payload', { status: 400 });
    }

    const { customer, line_items } = order;
    
    // 4. Extract Product IDs from SKUs
    // The SKU in Shopify MUST be the Murphy's Magic ProductID.
    const productIds = line_items
      .map((item: { sku: string }) => item.sku)
      .filter(Boolean) // Remove any items that don't have a SKU
      .join(',');

    if (!productIds) {
      console.log(`Order #${order.order_number} has no line items with SKUs. Skipping.`);
      return new Response('No products to process.', { status: 200 });
    }

    // 5. Prepare the data for Murphy's Magic API
    const formData = new FormData();
    formData.append('APIKey', MURPHY_API_KEY);
    formData.append('FirstName', customer.first_name || 'Customer');
    formData.append('LastName', customer.last_name || ' '); // Use a space if no last name
    formData.append('Email', customer.email);
    formData.append('ProductIds', productIds);

    // 6. Call the Murphy's Magic API to place the order
    const murphyResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!murphyResponse.ok) {
        const errorText = await murphyResponse.text();
        throw new Error(`Murphy's API Error: ${murphyResponse.status} - ${errorText}`);
    }

    const result = await murphyResponse.json();

    if (result.error) {
        throw new Error(`Murphy's API returned an error: ${result.error}`);
    }

    // 7. Handle the response and send a success status back to Shopify
    if (result.message === 'success') {
        console.log(`Successfully processed order #${order.order_number} for ${customer.email}.`);
        return new Response('Webhook processed successfully.', { status: 200 });
    } else {
        throw new Error(`Unknown success response from Murphy's API: ${JSON.stringify(result)}`);
    }

  } catch (error) {
    console.error('Failed to process Shopify webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Return a 500 status to let Shopify know it failed and it might retry
    return new Response(`Webhook processing failed: ${errorMessage}`, { status: 500 });
  }
}
