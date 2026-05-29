import { redirect } from 'next/navigation'

export default function Home() {
  // Redirecciona de forma instantánea y eficiente al catálogo oficial
  redirect('/productos')
}