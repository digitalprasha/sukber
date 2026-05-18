'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0d1f17',
          border: '1px solid rgba(5, 150, 105, 0.2)',
          color: '#e2e8f0',
        },
      }}
      richColors
      closeButton
    />
  )
}
