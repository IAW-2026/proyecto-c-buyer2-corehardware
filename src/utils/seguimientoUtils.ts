import React from 'react'
import { FaBox, FaTruck, FaCheckCircle } from 'react-icons/fa'

// Re-exportamos desde la fuente única de verdad
export { ESTADO_PEDIDO_LABEL } from '@/utils/pedidoUtils'

// ── Pasos del flujo de envío ───────────────────────────────────────────────

export const ENVIO_PASOS = ['pending', 'en_camino', 'entregado'] as const
export type EstadoEnvio = typeof ENVIO_PASOS[number]

// ── Config de estados del envío ────────────────────────────────────────────

export const ENVIO_CONFIG: Record<EstadoEnvio, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'Preparando envío', color: '#F0A500', bg: 'rgba(240,165,0,0.12)',  icon: FaBox },
  en_camino: { label: 'En camino',        color: '#00D1FF', bg: 'rgba(0,209,255,0.12)',  icon: FaTruck },
  entregado: { label: 'Entregado',        color: '#34D399', bg: 'rgba(52,211,153,0.12)', icon: FaCheckCircle },
}