import React from 'react'
import { FaClock, FaUserCheck, FaDolly, FaTruck, FaCheckCircle } from 'react-icons/fa'

// Re-exportamos desde la fuente única de verdad
export { ESTADO_PEDIDO_LABEL } from '@/utils/pedidoUtils'

// ── Estados del envío (vocabulario de Shipping — solo para mostrar) ───────
// Estos valores vienen tal cual de la Shipping API. NUNCA se escriben en Pedido.

export const ENVIO_PASOS = ['PENDIENTE', 'ASIGNADO', 'RETIRADO', 'EN_CAMINO', 'ENTREGADO'] as const
export type EstadoEnvio = typeof ENVIO_PASOS[number]

export const ENVIO_CONFIG: Record<EstadoEnvio, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDIENTE:  { label: 'Pendiente de asignación', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', icon: FaClock },
  ASIGNADO:   { label: 'Asignado a repartidor',   color: '#F0A500', bg: 'rgba(240,165,0,0.12)',   icon: FaUserCheck },
  RETIRADO:   { label: 'Retirado del depósito',    color: '#A855F7', bg: 'rgba(168,85,247,0.12)',  icon: FaDolly },
  EN_CAMINO:  { label: 'En camino',                color: '#00D1FF', bg: 'rgba(0,209,255,0.12)',   icon: FaTruck },
  ENTREGADO:  { label: 'Entregado',                color: '#34D399', bg: 'rgba(52,211,153,0.12)',  icon: FaCheckCircle },
}

// Devuelve la config de un estado de envío, con fallback si Shipping
// llega a agregar un estado nuevo que todavía no está mapeado acá.
export function getEnvioConfig(estado: string) {
  return ENVIO_CONFIG[estado as EstadoEnvio] ?? {
    label: estado,
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.12)',
    icon: FaClock,
  }
}