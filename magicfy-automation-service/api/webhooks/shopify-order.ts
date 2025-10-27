// Importamos los tipos de Vercel para que entienda las peticiones y respuestas.
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Esta es la dirección de la API de Murphy's para enviar pedidos de descargas.
// Es DIFERENTE de la que usamos para obtener productos.
const API_ENDPOINT = 'http://downloads.murphysmagic.com/api/AddOrder/';

/**
 * Esta función se encarga de recibir el aviso (webhook) desde Shopify cuando un pedido es pagado.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Empezamos un "diario" de actividad para poder depurar si algo sale mal.
  console.log("==================================================");
  console.log(`[DIARIO] Nuevo aviso de Shopify recibido a las: ${new Date().toISOString()}`);

  // 1. Nos aseguramos de que Shopify nos esté hablando con el método correcto (POST).
  if (req.method !== 'POST') {
    console.warn('[DIARIO] Petición bloqueada: No es una petición POST.');
    return res.status(405).send('Method Not Allowed');
  }

  // 2. Buscamos la clave secreta de la API de descargas de Murphy's en nuestra "caja fuerte" de Vercel.
  // Usamos una variable específica para evitar confusiones con la clave de Gemini.
  const MURPHYS_DOWNLOAD_API_KEY = process.env.MURPHYS_DOWNLOAD_API_KEY;
  if (!MURPHYS_DOWNLOAD_API_KEY) {
    console.error('[DIARIO] ERROR CRÍTICO: La clave MURPHYS_DOWNLOAD_API_KEY no está configurada en las variables de entorno.');
    return res.status(500).send('Error de configuración del servidor.');
  }
  console.log('[DIARIO] La clave de API de descargas de Murphy\'s está presente.');
  
  // Guardaremos el número de pedido aquí para usarlo en los mensajes.
  let orderNumber: string | null = null;

  try {
    // 3. Leemos los datos del pedido que nos envía Shopify. En Vercel, los datos vienen en `req.body`.
    const order = req.body;
    orderNumber = order.order_number || 'DESCONOCIDO';

    console.log(`[DIARIO] Recibidos y procesados los datos del pedido de Shopify #${orderNumber}.`);

    // Verificamos que los datos del pedido parezcan correctos.
    if (!order.customer || !order.line_items) {
      console.warn(`[DIARIO] El pedido #${orderNumber} tiene un formato inválido.`);
      return res.status(400).send('Payload inválido');
    }

    const { customer, line_items } = order;
    console.log(`[DIARIO] El pedido #${orderNumber} es para el cliente: ${customer.email}.`);
    
    // 4. Extraemos los IDs de los productos de Murphy's.
    // IMPORTANTE: El campo "SKU" en tu producto de Shopify DEBE ser el ID del producto en Murphy's.
    const productIds = line_items
      .map((item: { sku: string; title: string }) => {
        console.log(`[DIARIO] Revisando artículo: "${item.title}" con SKU: ${item.sku || 'Sin SKU'}`);
        return item.sku;
      })
      .filter(Boolean) // Quitamos cualquier artículo que no tenga SKU.
      .join(',');

    if (!productIds) {
      console.log(`[DIARIO] El pedido #${orderNumber} no tiene artículos con SKU. No se envía nada a Murphy's. Proceso finalizado.`);
      return res.status(200).send('No hay productos que procesar.');
    }

    console.log(`[DIARIO] IDs de producto encontrados (desde los SKUs) para el pedido #${orderNumber}: [${productIds}]`);

    // 5. Preparamos los datos para enviarlos a la API de Murphy's.
    const formData = new URLSearchParams();
    formData.append('APIKey', MURPHYS_DOWNLOAD_API_KEY);
    formData.append('FirstName', customer.first_name || 'Customer');
    formData.append('LastName', customer.last_name || ' '); // Un espacio si no hay apellido.
    formData.append('Email', customer.email);
    formData.append('ProductIds', productIds);
    
    console.log(`[DIARIO] Llamando a la API de Murphy's Magic para el pedido #${orderNumber}...`);

    // 6. Llamamos a la API de Murphy's para que procese el pedido de descarga.
    const murphyResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await murphyResponse.text();
    console.log(`[DIARIO] La API de Murphy's respondió con estado ${murphyResponse.status}. Respuesta: ${responseText}`);

    if (!murphyResponse.ok) {
        throw new Error(`Error de la API de Murphy's: Estado ${murphyResponse.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);

    if (result.error) {
        throw new Error(`La API de Murphy's devolvió un error: ${result.error}`);
    }

    // 7. Si todo ha ido bien, le decimos a Shopify "recibido, todo correcto".
    if (result.message === 'success') {
        console.log(`[DIARIO] ÉXITO: El pedido #${orderNumber} para ${customer.email} fue procesado correctamente por Murphy's.`);
        console.log("==================================================");
        return res.status(200).send('Webhook procesado con éxito.');
    } else {
        throw new Error(`Respuesta desconocida de la API de Murphy's: ${responseText}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ha ocurrido un error desconocido.';
    console.error(`[DIARIO] FALLO al procesar el aviso de Shopify para el pedido #${orderNumber || 'N/A'}: ${errorMessage}`);
    console.log("==================================================");
    // Avisamos a Shopify de que algo ha fallado para que pueda intentarlo de nuevo más tarde.
    return res.status(500).send(`Fallo al procesar el webhook: ${errorMessage}`);
  }
}