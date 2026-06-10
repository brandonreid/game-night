"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteBrianPlayer } from "@/app/actions"
import ConfirmationModal from "./confirmation-modal"

type Player = {
  id: string
  name: string
  games: string | null
  joined_at: string
}

export default function BrianPlayerList({ players }: { players: Player[] }) {
  const [mountedPlayers, setMountedPlayers] = useState<Player[]>([])
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (players.length > mountedPlayers.length) {
      const newPlayers = players.filter((p) => !mountedPlayers.some((mp) => mp.id === p.id))

      if (newPlayers.length > 0) {
        const timer = setTimeout(() => {
          setMountedPlayers((prev) => [...prev, newPlayers[0]])
        }, 300)

        return () => clearTimeout(timer)
      }
    } else {
      setMountedPlayers(players)
    }
  }, [players, mountedPlayers])

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player)
  }

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return

    setIsDeleting(true)
    try {
      await deleteBrianPlayer(playerToDelete.id)
    } catch (error) {
      console.error("Error deleting player:", error)
    } finally {
      setIsDeleting(false)
      setPlayerToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setPlayerToDelete(null)
  }

  if (players.length === 0) {
    return (
      <div className="text-center p-8 border border-emerald-700/50 bg-slate-800/50 rounded-lg">
        <p className="text-emerald-400 animate-pulse">NO PLAYERS REGISTERED YET</p>
        <p className="text-emerald-500/50 text-sm mt-2">Be the first to claim a spot!</p>
      </div>
    )
  }

  return (
    <>
      <div className="border-2 border-emerald-700/50 bg-slate-800/50 rounded-lg p-3">
        <div className="text-center mb-3 bg-emerald-900/30 py-2 rounded">
          <h2 className="text-xl font-bold text-emerald-400">PLAYERS</h2>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <AnimatePresence>
            {mountedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, type: "spring" }}
                className={cn(
                  "flex items-center p-3 border border-emerald-700/30 rounded",
                  "bg-gradient-to-r from-emerald-900/20 to-emerald-800/10",
                  index % 2 === 0 ? "bg-opacity-20" : "bg-opacity-10",
                )}
              >
                <div className="flex-1">
                  <div className="flex items-baseline">
                    <span className="text-emerald-300 font-bold mr-2">{index + 1}.</span>
                    <span className="text-emerald-400 text-lg font-bold tracking-wider">
                      {player.name.toUpperCase()}
                    </span>
                  </div>

                  {player.games && (
                    <div className="mt-1 text-sm text-emerald-400/60 pl-6">
                      GAMES: {player.games}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteClick(player)}
                  className="text-red-400 hover:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-500 p-1 transition-colors"
                  aria-label={`Remove ${player.name}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!playerToDelete}
        title="REMOVE PLAYER"
        message={`Are you sure you want to remove ${playerToDelete?.name} from Brian's game night?`}
        confirmLabel="REMOVE"
        cancelLabel="CANCEL"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  )
}
