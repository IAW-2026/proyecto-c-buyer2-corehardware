export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  marca?: string;
  modelo?: string;
  descripcion?: string;
  imagen?: string;
  stock?: number;
  categoria?: string;
}