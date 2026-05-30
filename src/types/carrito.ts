import { Product } from './producto';

export interface CartItem extends Product {
  cantidad: number;
}