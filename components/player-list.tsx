"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { deletePlayer, deleteAllPlayers } from "@/app/actions"
import ConfirmationModal from "./confirmation-modal"

type Player = {
  id: string
  name: string
  games: string | null
  joined_at: string
}

export default function PlayerList({ players }: { players: Player[] }) {
  const [mountedPlayers, setMountedPlayers] = useState<Player[]>([])
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  // This effect handles the animation of new players being added
  useEffect(() => {
    if (players.length > mountedPlayers.length) {
      // New players have been added
      const newPlayers = players.filter((p) => !mountedPlayers.some((mp) => mp.id === p.id))

      // Add new players one by one with a delay
      if (newPlayers.length > 0) {
        const timer = setTimeout(() => {
          setMountedPlayers((prev) => [...prev, newPlayers[0]])
        }, 300)

        return () => clearTimeout(timer)
      }
    } else {
      // Update the list if players were removed or reordered
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
      await deletePlayer(playerToDelete.id)
      // Player will be removed from the list when the server returns updated data
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

  const handleConfirmDeleteAll = async () => {
    setIsDeletingAll(true)
    try {
      await deleteAllPlayers()
    } catch (error) {
      console.error("Error deleting all players:", error)
    } finally {
      setIsDeletingAll(false)
      setConfirmDeleteAll(false)
    }
  }

  if (players.length === 0) {
    return (
      <div className="text-center p-8 border border-amber-700 bg-black">
        <p className="text-amber-500 animate-pulse">NO PLAYERS REGISTERED YET</p>
      </div>
    )
  }

  return (
    <>
      <div className="border-2 border-amber-700 bg-black/50 p-2">
        <div className="relative text-center mb-2 bg-amber-900/30 py-1">
          <h2 className="text-xl font-bold text-yellow-500">PLAYERS</h2>
          <button
            onClick={() => setConfirmDeleteAll(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-red-500 p-1 transition-colors"
            aria-label="Remove all players"
            title="Remove all players"
          >
            <X className="h-5 w-5" />
          </button>
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
                  "flex items-center p-3 border border-amber-700/50",
                  "bg-gradient-to-r from-amber-900/20 to-amber-800/10",
                  index % 2 === 0 ? "bg-opacity-20" : "bg-opacity-10",
                )}
              >
                <div className="flex-1">
                  <div className="flex items-baseline">
                    <span className="text-amber-300 font-bold mr-2">{index + 1}.</span>
                    <span className="text-yellow-500 text-lg font-bold tracking-wider">
                      {player.name.toUpperCase()}
                    </span>
                  </div>

                  {player.games && <div className="mt-1 text-sm text-amber-400/70 pl-6">GAMES: {player.games}</div>}
                </div>

                <button
                  onClick={() => handleDeleteClick(player)}
                  className="text-red-500 hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-red-500 p-1 transition-colors"
                  aria-label={`Remove ${player.name}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!playerToDelete}
        title="REMOVE PLAYER"
        message={`Are you sure you want to remove ${playerToDelete?.name} from the game night?`}
        confirmLabel="REMOVE"
        cancelLabel="CANCEL"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Delete-all Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDeleteAll}
        title="REMOVE ALL PLAYERS"
        message={`Are you sure you want to remove all ${players.length} players from the game night? This cannot be undone.`}
        confirmLabel="REMOVE ALL"
        cancelLabel="CANCEL"
        isProcessing={isDeletingAll}
        onConfirm={handleConfirmDeleteAll}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </>
  )
}
