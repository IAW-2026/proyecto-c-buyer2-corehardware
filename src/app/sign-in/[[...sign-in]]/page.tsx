'use client'
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0D1117'
    }}>
      <SignIn appearance={{
        variables: {
          colorPrimary: '#00D1FF',
          colorBackground: '#161B22',
          colorText: '#E6EDF3',
          colorTextSecondary: '#8B949E',
          colorInputBackground: '#0D1117',
          colorInputText: '#E6EDF3',
        }
      }} />
    </div>
  )
}