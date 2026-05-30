// Estados posibles según Shipping App
// pending → en_camino → entregado
export const MOCK_SHIPMENTS = [
  {
    id: 1,
    pedido_id: 1,
    fecha_de_entrega: '2026-03-15',
    estado: 'entregado',
    monto: 3078500,   // productos + envío
    direccion: 'Av. Corrientes 1234, CABA',
  },
  {
    id: 2,
    pedido_id: 2,
    fecha_de_entrega: '2026-04-10',
    estado: 'entregado',
    monto: 318500,
    direccion: 'Av. Corrientes 1234, CABA',
  },
  {
    id: 3,
    pedido_id: 5,
    fecha_de_entrega: '2026-03-28',
    estado: 'entregado',
    monto: 2108500,
    direccion: 'Calle Falsa 456, Rosario',
  },
  {
    id: 4,
    pedido_id: 8,
    fecha_de_entrega: '2026-02-20',
    estado: 'entregado',
    monto: 788500,
    direccion: 'San Martín 789, Córdoba',
  },
  {
    id: 5,
    pedido_id: 9,
    fecha_de_entrega: '2026-04-08',
    estado: 'entregado',
    monto: 628500,
    direccion: 'San Martín 789, Córdoba',
  },
  {
    id: 6,
    pedido_id: 11,
    fecha_de_entrega: '2026-05-05',
    estado: 'entregado',
    monto: 458500,
    direccion: 'Belgrano 321, Mendoza',
  },
  {
    id: 7,
    pedido_id: 3,
    fecha_de_entrega: '2026-05-08',
    estado: 'en_camino',
    monto: 1458500,
    direccion: 'Av. Corrientes 1234, CABA',
  },
]