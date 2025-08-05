"use client"

import type React from "react"

// Simplified version of the use-toast hook
import { useState, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  open?: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ title, description, action }: Omit<ToastProps, "id" | "open">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, title, description, action, open: true }

    setToasts((prevToasts) => [...prevToasts, newToast])

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 5000)

    return { id, update: () => {}, dismiss: () => {} }
  }, [])

  return { toast, toasts }
}

