"use client"

import { Suspense, useEffect, useState } from "react"
import PlayerList from "@/components/player-list"
import AddPlayerForm from "@/components/add-player-form"
import GameNightInfo from "@/components/game-night-info"
import TableSorter from "@/components/table-sorter"
import BrianBoardModal from "@/components/brian-board-modal"
import { useSecretKnock } from "@/hooks/use-secret-knock"
import { cn } from "@/lib/utils"

type Player = {
  id: string
  name: string
  games: string | null
  joined_at: string
}

type GameNightClientProps = {
  players: Player[]
  gameNightInfo: {
    date: string
    description: string
  }
  brianPlayers: Player[]
  brianGameNightInfo: {
    date: string
    description: string
  }
}

// Component for individual clickable letters
function ClickableLetter({ 
  letter, 
  onClick, 
  showFeedback 
}: { 
  letter: string
  onClick: (letter: string) => void
  showFeedback: boolean 
}) {
  const isSpace = letter === " "
  
  if (isSpace) {
    return <span className="inline-block w-3">&nbsp;</span>
  }

  return (
    <span
      onClick={() => onClick(letter)}
      className={cn(
        "cursor-pointer select-none transition-all duration-150 hover:text-amber-300",
        showFeedback && "text-emerald-400"
      )}
    >
      {letter}
    </span>
  )
}

// The header text with each letter as a clickable element
function SecretHeader({ 
  onLetterClick, 
  showFeedback 
}: { 
  onLetterClick: (letter: string) => void
  showFeedback: boolean 
}) {
  const headerText = "Techie Game Night"
  
  return (
    <h1 
      className={cn(
        "text-4xl font-bold tracking-wider mb-2 text-yellow-500 animate-pulse",
        showFeedback && "animate-bounce"
      )}
    >
      {headerText.split("").map((letter, index) => (
        <ClickableLetter
          key={index}
          letter={letter}
          onClick={onLetterClick}
          showFeedback={showFeedback}
        />
      ))}
    </h1>
  )
}

export default function GameNightClient({ 
  players, 
  gameNightInfo, 
  brianPlayers, 
  brianGameNightInfo 
}: GameNightClientProps) {
  const { registerLetter, isUnlocked, closeSecretBoard, showFeedback, progress, patternLength } = useSecretKnock()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if today is game night
  const gameNightDate = new Date(gameNightInfo.date)
  const today = new Date()
  const isGameNight =
    today.getFullYear() === gameNightDate.getFullYear() &&
    today.getMonth() === gameNightDate.getMonth() &&
    today.getDate() === gameNightDate.getDate()

  const showSortButton = isGameNight && players.length > 6

  return (
    <div className="min-h-screen bg-black text-amber-500 font-mono p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-4">
          {/* Each letter in the header is clickable for the secret code */}
          <SecretHeader 
            onLetterClick={registerLetter} 
            showFeedback={showFeedback} 
          />
          
          {/* Subtle progress indicator - only visible when user starts the pattern */}
          {mounted && progress > 0 && progress < patternLength && (
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: patternLength }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    i < progress ? "bg-emerald-500" : "bg-gray-700"
                  )}
                />
              ))}
            </div>
          )}
        </header>

        {/* Decorative divider */}
        <div 
          className={cn(
            "h-[3px] w-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent mb-4",
            showFeedback && "via-emerald-400"
          )}
        />

        <Suspense fallback={<div className="text-center">Loading game night info...</div>}>
          <GameNightInfo gameNightInfo={gameNightInfo} />
        </Suspense>

        <div className="mt-8">
          <Suspense fallback={<div className="text-center">Loading players...</div>}>
            <PlayerList players={players} />
          </Suspense>
        </div>

        <div className="mt-8">
          <AddPlayerForm />
        </div>

        {showSortButton && (
          <div className="mt-8 text-center">
            <TableSorter players={players} />
          </div>
        )}
      </div>

      {/* Secret Game Night Modal */}
      <BrianBoardModal
        isOpen={isUnlocked}
        onClose={closeSecretBoard}
        players={brianPlayers}
        gameNightInfo={brianGameNightInfo}
      />
    </div>
  )
}
