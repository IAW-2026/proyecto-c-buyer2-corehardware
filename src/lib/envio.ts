export function calcularCostoEnvio(subtotal: number): number {
  if (subtotal === 0) return 0
  return subtotal > 500000 ? 0 : 8500
}