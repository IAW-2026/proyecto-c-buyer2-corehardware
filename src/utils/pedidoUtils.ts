import React from 'react'
import { EstadoPedido } from '@/types/pedido'
import {
  FaCheckCircle, FaClock, FaTimesCircle,
  FaTools, FaTruck,
} from 'react-icons/fa'

// ── Config de estados de pedido ────────────────────────────────────────────

export const ESTADO_CONFIG: Record<EstadoPedido, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDIENTE_PAGO:  { label: 'Pendiente de pago',  color: '#F0A500', bg: 'rgba(240,165,0,0.12)',    icon: FaClock },
  PAGO_APROBADO:   { label: 'Pago aprobado',       color: '#00D1FF', bg: 'rgba(0,209,255,0.12)',    icon: FaCheckCircle },
  PAGO_RECHAZADO:  { label: 'Pago rechazado',      color: '#F85149', bg: 'rgba(248,81,73,0.12)',    icon: FaTimesCircle },
  EN_PREPARACION:  { label: 'En preparación',      color: '#A78BFA', bg: 'rgba(167,139,250,0.12)',  icon: FaTools },
  EN_CAMINO:       { label: 'En camino',            color: '#34D399', bg: 'rgba(52,211,153,0.12)',   icon: FaTruck },
  ENTREGADO:       { label: 'Entregado',            color: '#34D399', bg: 'rgba(52,211,153,0.12)',   icon: FaCheckCircle },
  CANCELADO:       { label: 'Cancelado',            color: '#8B949E', bg: 'rgba(139,148,158,0.12)',  icon: FaTimesCircle },
}

// ── Pasos del flujo de pedido ──────────────────────────────────────────────

export const PASOS_FLUJO: EstadoPedido[] = [
  'PENDIENTE_PAGO',
  'PAGO_APROBADO',
  'EN_PREPARACION',
  'EN_CAMINO',
  'ENTREGADO',
]

// ── Config de estados de envío ─────────────────────────────────────────────

export const ENVIO_ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'Pendiente',  color: '#F0A500', bg: 'rgba(240,165,0,0.12)',   icon: FaClock },
  en_camino: { label: 'En camino',  color: '#34D399', bg: 'rgba(52,211,153,0.12)',  icon: FaTruck },
  entregado: { label: 'Entregado',  color: '#00D1FF', bg: 'rgba(0,209,255,0.12)',   icon: FaCheckCircle },
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function formatMonto(monto: number): string {
  return monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function agruparProductos(ids: number[]): { id: number; cantidad: number }[] {
  const map = new Map<number, number>()
  for (const id of ids) map.set(id, (map.get(id) ?? 0) + 1)
  return Array.from(map.entries()).map(([id, cantidad]) => ({ id, cantidad }))
}

export const ESTADO_PEDIDO_LABEL: Record<EstadoPedido, string> = {
  PENDIENTE_PAGO: 'Pendiente de pago',
  PAGO_APROBADO: 'Pago aprobado',
  PAGO_RECHAZADO: 'Pago rechazado',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}
