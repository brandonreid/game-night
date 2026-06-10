"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Home, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import BrianPlayerList from "./brian-player-list"
import BrianAddPlayerForm from "./brian-add-player-form"
import CalendarButtons from "./calendar-buttons"

type Player = {
  id: string
  name: string
  games: string | null
  joined_at: string
}

type BrianBoardModalProps = {
  isOpen: boolean
  onClose: () => void
  players: Player[]
  gameNightInfo: {
    date: string
    description: string
  }
}

export default function BrianBoardModal({ isOpen, onClose, players, gameNightInfo }: BrianBoardModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!mounted) return null

  // Format the date for display
  const gameNightDate = new Date(gameNightInfo.date)
  const formattedDate = format(gameNightDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(gameNightDate, "h:mm a")

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full h-full md:w-[95vw] md:h-[95vh] md:max-w-5xl",
              "md:rounded-lg overflow-hidden",
              "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900",
              "border-2 border-emerald-600/50",
              "shadow-[0_0_50px_rgba(16,185,129,0.3)]"
            )}
          >
            {/* Cozy basement ambiance overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 z-10",
                "p-2 rounded-full",
                "bg-slate-800/80 border border-emerald-600/50",
                "text-emerald-400 hover:text-emerald-300",
                "hover:bg-slate-700/80 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500"
              )}
              aria-label="Close Secret Game Night"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Scrollable content */}
            <div className="h-full overflow-y-auto p-4 md:p-6">
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Home className="h-8 w-8 text-emerald-400" />
                    <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-emerald-400">
                      Secret Game Night
                    </h1>
                    <Gamepad2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-emerald-300/70 text-sm">The exclusive board game hideout</p>
                </header>

                {/* Decorative divider */}
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent mb-6" />

                {/* Game Night Info */}
                <div className="border-2 border-emerald-700/50 bg-slate-800/50 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-2">NEXT SESSION</h2>
                    <div className="text-xl text-emerald-300">
                      {formattedDate} at {formattedTime}
                    </div>
                  </div>

                  <div className="mt-4 text-emerald-200/80 bg-emerald-900/20 p-3 rounded border border-emerald-700/30">
                    <div
                      dangerouslySetInnerHTML={{ __html: gameNightInfo.description }}
                      className="prose prose-invert prose-emerald max-w-none"
                    />
                  </div>

                  {/* Calendar Buttons */}
                  <CalendarButtons
                    date={gameNightInfo.date}
                    title="Secret Game Night"
                    description="Exclusive board game session - invite only!"
                    location="Secret Location"
                    variant="emerald"
                  />
                </div>

                {/* Players List */}
                <div className="mb-6">
                  <BrianPlayerList players={players} />
                </div>

                {/* Add Player Form */}
                <div>
                  <BrianAddPlayerForm />
                </div>

                {/* Footer hint */}
                <div className="mt-8 text-center">
                  <p className="text-emerald-500/50 text-xs">
                    Shhh... this is invite-only
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
