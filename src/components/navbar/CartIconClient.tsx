'use client'

import { useContext } from 'react'
import { CartContext } from '@/context/CartContext'
import { CartIcon } from './CartIcon'

export function CartIconClient() {
  const cart = useContext(CartContext)
  const totalItems = cart?.totalItems ?? 0
  return <CartIcon totalItems={totalItems} />
}