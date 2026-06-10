"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type ConfirmationModalProps = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  isProcessing?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Focus the confirm button when the modal opens
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative z-10 w-full max-w-md bg-black border-2 border-amber-700 p-6"
          >
            {/* Glitch effect line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-amber-500 opacity-50 animate-scanline" />

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-red-500 mb-2">{title}</h2>
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            </div>

            <p className="text-amber-400 mb-6 text-center">{message}</p>

            <div className="flex space-x-4">
              <button
                ref={confirmButtonRef}
                onClick={onConfirm}
                disabled={isProcessing}
                className={cn(
                  "flex-1 bg-red-900/50 border border-red-500 text-red-500 py-2 px-4",
                  "hover:bg-red-800/50 focus:outline-none focus:ring-1 focus:ring-red-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors",
                )}
              >
                {isProcessing ? "PROCESSING..." : confirmLabel}
              </button>
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className={cn(
                  "flex-1 bg-amber-900/50 border border-amber-500 text-amber-500 py-2 px-4",
                  "hover:bg-amber-800/50 focus:outline-none focus:ring-1 focus:ring-amber-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors",
                )}
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
