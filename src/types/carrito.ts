import { ProductSummary } from "./producto";

export interface CartItem extends ProductSummary {
  cantidad: number;
  carritoItemId?: number;
}