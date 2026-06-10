"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { sortPlayersIntoTables } from "@/app/actions"
import { cn } from "@/lib/utils"
import { Dices } from "lucide-react"

type Player = {
  name: string
  games: string | null
}

export default function TableSorter({ players }: { players: Player[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [tables, setTables] = useState<Player[][]>([])
  const [isSorting, setIsSorting] = useState(false)
  const [sortingStep, setSortingStep] = useState(0)

  const handleSort = async () => {
    setIsOpen(true)
    setIsSorting(true)
    setSortingStep(0)

    // Step 1: Show all players
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSortingStep(1)

    // Step 2: Shuffle animation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSortingStep(2)

    // Step 3: Sort into tables
    const sortedTables = await sortPlayersIntoTables(players)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setTables(sortedTables)
    setSortingStep(3)
    setIsSorting(false)
  }

  return (
    <>
      <button
        onClick={handleSort}
        className={cn(
          "bg-red-900/50 border-2 border-red-500 text-red-500 py-3 px-6",
          "hover:bg-red-800/50 focus:outline-none focus:ring-2 focus:ring-red-500",
          "text-xl font-bold tracking-wider animate-pulse",
          "transition-colors flex items-center justify-center gap-2 mx-auto",
        )}
      >
        <Dices className="h-6 w-6" />
        SORT PLAYERS INTO TABLES
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border-2 border-amber-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-yellow-500 mb-2">
                  {sortingStep < 3 ? "SORTING PLAYERS..." : "TABLE ASSIGNMENTS"}
                </h2>
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
              </div>

              {sortingStep === 0 && (
                <div className="text-center text-amber-500 text-xl animate-pulse">INITIALIZING SORT ALGORITHM...</div>
              )}

              {sortingStep === 1 && (
                <div className="space-y-2">
                  <div className="text-center text-amber-500 mb-4">SHUFFLING PLAYERS...</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {players.map((player, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          x: Math.random() * 20 - 10,
                          y: Math.random() * 20 - 10,
                          transition: { duration: 0.3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
                        }}
                        className="bg-amber-900/30 border border-amber-700 p-2 text-center"
                      >
                        {player.name}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {sortingStep === 2 && (
                <div className="text-center text-amber-500 text-xl animate-pulse">
                  CALCULATING OPTIMAL TABLE DISTRIBUTION...
                </div>
              )}

              {sortingStep === 3 && (
                <div className="space-y-6">
                  {tables.map((table, tableIndex) => (
                    <motion.div
                      key={tableIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: tableIndex * 0.2 }}
                      className="border-2 border-amber-700 bg-amber-900/20"
                    >
                      <div className="bg-amber-900/50 p-2 text-center">
                        <h3 className="text-xl font-bold text-yellow-500">TABLE {tableIndex + 1}</h3>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {table.map((player, playerIndex) => (
                            <motion.div
                              key={playerIndex}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: tableIndex * 0.2 + playerIndex * 0.1 }}
                              className="bg-black border border-amber-700 p-3"
                            >
                              <div className="font-bold text-amber-400">{player.name}</div>
                              {player.games && (
                                <div className="text-sm text-amber-400/70 mt-1">Games: {player.games}</div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isSorting}
                  className={cn(
                    "bg-amber-900/50 border border-amber-500 text-amber-500 py-2 px-6",
                    "hover:bg-amber-800/50 focus:outline-none focus:ring-1 focus:ring-amber-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-colors",
                  )}
                >
                  {isSorting ? "SORTING..." : "CLOSE"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
