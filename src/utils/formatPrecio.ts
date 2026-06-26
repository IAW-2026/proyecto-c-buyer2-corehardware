export function formatPrecio(precio: number): string {
  const [entero, decimales] = precio.toFixed(2).split('.')
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decimales === '00'
    ? `$\u00A0${miles}`
    : `$\u00A0${miles},${decimales}`
}