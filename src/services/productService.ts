import { MOCK_PRODUCTS, Product } from '@/data/mockProducts';

interface GetProductsParams {
  offset?: number;
  limit?: number;
  name?: string;
  brand?: string;
}

export const getProducts = async ({ 
  offset = 0, 
  limit = 20, 
  name = '', 
  brand = '' 
}: GetProductsParams = {}) => {
  
  const baseUrl = `${process.env.NEXT_PUBLIC_SELLER_API_URL}/products`;
  const apiKey = process.env.NEXT_PUBLIC_SELLER_API_KEY;

  // Construcción de la URL con Query Params
  const url = new URL(baseUrl);
  url.searchParams.append('offset', offset.toString());
  url.searchParams.append('limit', limit.toString());
  if (name) url.searchParams.append('name', name);
  if (brand) url.searchParams.append('brand', brand);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey || ''
      }
    });

    // Manejo de respuestas según el contrato
    if (response.status === 204) {
      return { items: [], total: 0 }; // Respuesta exitosa pero vacía
    }

    if (response.status === 404) {
      const errorData = await response.json();
      console.warn("Productos no encontrados:", errorData.message);
      return { items: [], total: 0 };
    }

    if (!response.ok) throw new Error("Error en la conexión con Seller");

    const data = await response.json();
    return {
      items: data, // La API devuelve la lista directa
      total: 45    // Idealmente la API debería devolver el total, si no lo hace, usamos el del mock
    };

  } catch (error) {
    // Lógica de Mocking para desarrollo
    console.log("Modo desarrollo: Usando MOCK_PRODUCTS");
    
    // Simulamos el filtrado y paginado en los mocks para que tu UI funcione igual
    let filtered = [...MOCK_PRODUCTS];
    
    if (name) {
      filtered = filtered.filter(p => p.nombre.toLowerCase().includes(name.toLowerCase()));
    }
    if (brand) {
      filtered = filtered.filter(p => p.marca.toLowerCase() === brand.toLowerCase());
    }

    const paginatedItems = filtered.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total: filtered.length
    };
  }
};

/**
 * GET api/products/{id}
 */
export const getProductById = async (id: number) => {
  const url = `${process.env.NEXT_PUBLIC_SELLER_API_URL}/products/${id}`;
  const apiKey = process.env.NEXT_PUBLIC_SELLER_API_KEY;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey || ''
      }
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Error al obtener detalle");

    return await response.json();

  } catch (error) {
    // Si falla, buscamos en los mocks
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }
};