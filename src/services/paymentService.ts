interface CheckoutPayload {
  id: number;
  fecha: string;
  compradorId: number;
  vendedorId: number;
  productos: number[];
  monto: number;
}

//  Cambiar esto a 'false' cuando el backend está listo
const USE_MOCK_PAYMENT = true;

const PAYMENTS_API_URL = process.env.NEXT_PUBLIC_PAYMENTS_API_URL;

export const PaymentService = {
  async iniciarCheckout(payload: CheckoutPayload, token: string) {

    // 1. MODO SIMULACIÓN 
    if (USE_MOCK_PAYMENT) {
      console.log("[Mock] Simulando petición a pagos con:", payload);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: "Simulación exitosa",
            init_point: "https://sandbox.mercadopago.com/pago-falso"
          });
        }, 800); // Pequeña demora para que se note la carga
      });
    }

    // 2. MODO REAL (Para la 3ra etapa)
    try {
      if (!PAYMENTS_API_URL) throw new Error("URL de pagos no configurada");

      const response = await fetch(`${PAYMENTS_API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 201) {
        return await response.json();
      }
      // Código 400: Error de datos (Petición mal formada)
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({ message: 'Datos de pedido inválidos' }));
        throw new Error(`Error 400: ${errorData.message}`);
      }

      // Código 405: Error de método (El servidor no acepta este tipo de petición)
      if (response.status === 405) {
        const errorData = await response.json().catch(() => ({ message: 'Método no permitido por el servidor' }));
        throw new Error(`Error 405: ${errorData.message}`);
      }

      // Cualquier otro error no contemplado
      throw new Error(`Error inesperado: Código de respuesta ${response.status}`);

    } catch (error) {
      console.error("Fallo en PaymentService.iniciarCheckout:", error);
      throw error; // Relanzamos para que la UI (carrito) pueda mostrar el toast
    }
  }
};