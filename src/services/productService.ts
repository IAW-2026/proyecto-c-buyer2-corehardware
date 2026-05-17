import { MOCK_PRODUCTS_SUMMARY, MOCK_PRODUCTS_DETAIL, ProductSummary, Product } from '@/data/mockProducts';

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
}: GetProductsParams = {}): Promise<{ items: ProductSummary[], total: number }> => {
  
  const baseUrl = `${process.env.NEXT_PUBLIC_SELLER_API_URL}/products`;
  const apiKey = process.env.NEXT_PUBLIC_SELLER_API_KEY;

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

    if (response.status === 204) {
      return { items: [], total: 0 };
    }

    if (response.status === 404) {
      const errorData = await response.json();
      console.warn("Productos no encontrados:", errorData.message);
      return { items: [], total: 0 };
    }

    if (!response.ok) throw new Error("Error en la conexión con Seller");

    const data = await response.json();
    return {
      items: data,
      total: MOCK_PRODUCTS_SUMMARY.length
    };

  } catch (error) {
    console.log("Modo desarrollo: Usando MOCK_PRODUCTS_SUMMARY");
    
    let filtered = [...MOCK_PRODUCTS_SUMMARY]; // ← cambio

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
export const getProductById = async (id: number): Promise<Product | null> => {
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
    console.log("Modo desarrollo: Usando MOCK_PRODUCTS_DETAIL");
    return MOCK_PRODUCTS_DETAIL.find(p => p.id === id) || null; // ← cambio
  }
};