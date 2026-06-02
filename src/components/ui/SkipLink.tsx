'use client'

export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{ position: 'absolute', left: '-9999px', top: 'auto', zIndex: 9999 }}
      onFocus={(e) => {
        Object.assign(e.currentTarget.style, {
          left: '1rem',
          top: '1rem',
          background: 'var(--chakra-colors-brand-accent)',
          color: 'var(--chakra-colors-brand-bgMain)',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: '600',
          fontSize: '0.875rem',
          textDecoration: 'none',
        })
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px'
      }}
    >
      Ir al contenido principal
    </a>
  )
}