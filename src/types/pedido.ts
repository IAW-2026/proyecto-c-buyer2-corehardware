// Definimos los estados posibles según tu flujo de Marketplace
export type EstadoPedido = 
  | 'PENDIENTE_PAGO' 
  | 'PAGADO' 
  | 'RECHAZADO' 
  | 'EN_CAMINO' 
  | 'ENTREGADO';

export interface Pedido {
  id: string;
  fecha: Date;
  compradorId: string;
  productos: number[]; // IDs de productos
  monto: number;
  estado: EstadoPedido;
  envioId?: string;
}