// Esto es lo que devuelve GET /api/products/ (Resumido)
export interface ProductSummary {
  id: number;
  nombre: string;
  vendedor: string;
  marca: string;
  modelo: string;
  precio: number;
  stock: number;
  imagen: string;
}

// Esto es lo que devuelve GET /api/products/{id} (Completo)
export interface Product extends ProductSummary {
  vendedorId: number;
  descripcion: string;
  especificaciones: string;
  garantia: string;
}