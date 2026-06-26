export function validateApiKey(req: Request): boolean {
  const expectedKey = process.env.BUYER_API_KEY
  if (!expectedKey) {
    console.error('BUYER_API_KEY no está configurada')
    return false
  }
  // Comparamos con la variable de entorno que definiremos en tu .env
  const apiKey = req.headers.get('x-api-key')
  return apiKey === expectedKey
}