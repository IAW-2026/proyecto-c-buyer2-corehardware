// src/app/carrito/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/db/db'; // Ajustá la ruta según tu proyecto

export default async function CarritoPage() {
  // 1. Validar autenticación en el Servidor
  const { userId } = await auth();
  
  if (!userId) {
    // Si no está logueado, Clerk nos ayuda a mandarlo a iniciar sesión
    redirect('/sign-in?redirect_url=/carrito');
  }

  const user = await currentUser();

  // 2. Simulación de ítems en el carrito por ahora (luego vendrá del estado/localStorage)
  const itemsSimulados = [
    { id: '1', nombre: 'Procesador AMD Ryzen 7 5700X', precio: 240000, cantidad: 1, imagen: '/images/ryzen7.jpg' },
    { id: '2', nombre: 'Memoria RAM DDR4 16GB Kingston Fury', precio: 55000, cantidad: 2, imagen: '/images/ram.jpg' },
  ];

  const subtotal = itemsSimulados.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const envio = 4500;
  const total = subtotal + envio;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Tu Carrito de Compras</h1>
      <p style={{ color: '#666' }}>Comprador: <strong>{user?.firstName} ({user?.emailAddresses[0].emailAddress})</strong></p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginTop: '2rem' }}>
        {/* Lista de Productos */}
        <div>
          {itemsSimulados.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #ccc' }}>
              <div>
                <h3 style={{ margin: 0 }}>{item.nombre}</h3>
                <p style={{ margin: '0.5rem 0 0 0', color: '#888' }}>${item.precio.toLocaleString('es-AR')} x {item.cantidad}</p>
              </div>
              <span style={{ fontWeight: 'bold' }}>${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>

        {/* Resumen del Pedido */}
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9', height: 'fit-content' }}>
          <h2>Resumen</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString('es-AR')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Envío:</span>
            <span>${envio.toLocaleString('es-AR')}</span>
          </div>
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Total:</span>
            <span>${total.toLocaleString('es-AR')}</span>
          </div>
          
          {/* El botón de pagar que usaremos en el paso 4 */}
          <button style={{ width: '100%', padding: '0.75rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer' }}>
            Proceder al Pago
          </button>
        </div>
      </div>
    </div>
  );
}