'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
  confirmText?: string
  variant?: 'danger' | 'warning'
  requireCheckbox?: boolean
  checkboxLabel?: string
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  variant = 'danger',
  requireCheckbox = false,
  checkboxLabel,
}: ConfirmModalProps) {
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="text-center">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
          <AlertTriangle className={variant === 'danger' ? 'text-red-400' : 'text-amber-400'} size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{message}</p>
        {requireCheckbox && checkboxLabel && (
          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 rounded border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">{checkboxLabel}</span>
          </label>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-card-border)] text-[var(--color-text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--color-hover)] transition-all text-sm font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={requireCheckbox ? !checked : false}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'}`}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
