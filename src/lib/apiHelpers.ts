export function getExternalApiHeaders(apiKey: string | undefined, keyName: string): HeadersInit {
  console.log(`${keyName} cargada:`, apiKey ? 'SÍ' : 'NO')
  if (!apiKey) console.error(`${keyName} no está configurada`)
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
  }
}

export function getSellerHeaders(): HeadersInit {
  return getExternalApiHeaders(process.env.SELLER_API_KEY, 'SELLER_API_KEY')
}

export function getShippingHeaders(): HeadersInit {
  return getExternalApiHeaders(process.env.SHIPPING_API_KEY, 'SHIPPING_API_KEY')
}