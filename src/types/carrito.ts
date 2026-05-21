import { Producto } from './producto';

export interface CartItem extends Producto {
  cantidad: number;
}