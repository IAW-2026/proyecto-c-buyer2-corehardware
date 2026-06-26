# CoreHardware — Buyer App

## 📚 Enunciado del Proyecto

[https://iaw-2026.github.io/proyecto/](https://iaw-2026.github.io/proyecto/)

## 🔗 Deploy de Producción

**[https://proyecto-c-buyer2-corehardware.vercel.app](https://proyecto-c-buyer2-corehardware.vercel.app)**
---

## 👤 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Comprador 1 | `buyer_1+clerk_test@iaw.com` | `iawuser#` |
| Administrador | `admin+clerk_test@iaw.com` | `iawuser#` |

---

## 📋 Instrucciones de Uso

1. Accedé al deploy de producción con cualquiera de los usuarios listados arriba.
2. Los compradores (`buyer1` a `buyer6`) pueden explorar productos, realizar pedidos y hacer el seguimiento de sus envíos.
3. El administrador (`admin`) tiene acceso al panel de administración con gestión completa de compradores y pedidos.
4. La aplicación cuenta con datos precargados: compradores registrados, pedidos en distintos estados y envíos en curso, para que puedas recorrer todos los flujos sin necesidad de cargar información manualmente.

---

## 📝 Descripción del Proyecto

CoreHardware es un marketplace de hardware enfocado en centralizar la compra-venta de componentes y periféricos tecnológicos. La **Buyer App** es la interfaz principal para los compradores: permite explorar el catálogo de productos publicados por los vendedores, realizar pedidos y hacer el seguimiento de los envíos en tiempo real.

La aplicación se comunica con las otras tres apps del ecosistema (Seller App, Shipping App y Payments App) mediante APIs REST, respetando los contratos definidos en la Etapa 1. El procesamiento de pagos es gestionado por la Payments App a través de Mercado Pago en modo sandbox.

La autenticación está centralizada en Clerk, con roles diferenciados para compradores y administradores. Los compradores acceden a su historial de compras y seguimiento de pedidos, mientras que el administrador dispone de un panel con gestión de usuarios y reportes de órdenes.

---

## 🗒️ Notas para la Corrección

- **Paginación y búsqueda:** implementadas con parámetros en la URL en el listado de productos y en el historial de pedidos del panel de administración.
- **Variables de entorno:** el archivo `.env.example` en el repositorio lista todas las variables necesarias para correr la app localmente.
