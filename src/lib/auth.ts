
export function validateApiKey(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  
  // Comparamos con la variable de entorno que definiremos en tu .env
  return apiKey === process.env.BUYER_API_KEY;
}