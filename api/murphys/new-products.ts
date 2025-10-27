// Importamos las herramientas que necesitamos.
// VercelRequest y VercelResponse son para que Vercel entienda las peticiones y respuestas.
import type { VercelRequest, VercelResponse } from '@vercel/node';
// La herramienta para hablar el idioma SOAP.
import soapRequest from 'easy-soap-request';
// La herramienta para convertir de XML a JSON.
import { parseStringPromise } from 'xml2js';
import { UpdateType } from '../../types';


// La dirección de la API de Murphy's Magic.
const MURPHYS_API_URL = 'https://www.murphysmagic.com/api/v1/murphys.wsdl';

// Esta es la función principal que se ejecutará cuando tu app llame a "/api/murphys/new-products".
export default async function handler(req: VercelRequest, res: VercelResponse) {
  
  // Paso 1: Obtener las credenciales de forma segura.
  // "process.env" es la caja fuerte de Vercel donde guardaremos nuestras claves.
  // ¡NUNCA escribas tu usuario o contraseña directamente en el código!
  const username = process.env.MURPHYS_USERNAME;
  const password = process.env.MURPHYS_PASSWORD;

  // Si no hemos configurado las credenciales en Vercel, detenemos todo y avisamos.
  if (!username || !password) {
    return res.status(500).json({ message: 'Las credenciales de la API de Murphy\'s no están configuradas en el servidor.' });
  }

  // Paso 2: Preparar el mensaje que enviaremos a Murphy's en formato XML.
  // Esta estructura es específica de la API de Murphy's.
  const xml = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:MurphysMagicAPIService">
       <soapenv:Header/>
       <soapenv:Body>
          <urn:GetNewItems>
             <API_USER>${username}</API_USER>
             <API_PASS>${password}</API_PASS>
          </urn:GetNewItems>
       </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    // Paso 3: Enviar la petición a Murphy's usando nuestra herramienta.
    const { response } = await soapRequest({
      url: MURPHYS_API_URL,
      headers: { 'Content-Type': 'text/xml;charset=UTF-8' },
      xml: xml,
    });

    const { body } = response;
    
    // Paso 4: Convertir la respuesta (que está en XML) a un formato fácil de usar (JSON).
    const result = await parseStringPromise(body, { explicitArray: false, trim: true });

    // Paso 5: Extraer y limpiar los datos que nos interesan.
    // La ruta para llegar a los productos puede variar, esto es un ejemplo basado en su API.
    const items = result['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:GetNewItemsResponse']['MMAPI_ITEMS']['item'] || [];

    // Nos aseguramos de que "items" siempre sea una lista, aunque solo venga un producto.
    const itemsArray = Array.isArray(items) ? items : [items];

    // Transformamos cada producto al formato que nuestra app entiende (el formato definido en `types.ts`).
    const products = itemsArray.map((item: any) => ({
      id: item.ITEM_ID,
      name: item.ITEM_NAME,
      price: parseFloat(item.DEALER_COST),
      stock: parseInt(item.QTY_OH),
      creator: item.CREATOR,
      type: item.PRODUCT_TYPE, // Esto podría ser 'Video', 'eBook', 'Physical', etc.
      updateType: UpdateType.NEW, // Marcamos que es un producto nuevo.
    }));

    // Paso 6: Enviar la lista de productos ya limpia a nuestra aplicación.
    // El status(200) significa "Todo ha ido bien".
    res.status(200).json({ products });

  } catch (error) {
    // Si algo falla en cualquiera de los pasos anteriores, atrapamos el error.
    console.error('La petición SOAP ha fallado:', error);
    // Y enviamos un mensaje de error a nuestra aplicación.
    res.status(500).json({ message: "No se pudieron obtener los datos de la API de Murphy's Magic." });
  }
}