"use client"

import { useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import CalendarButtons from "./calendar-buttons"

type GameNightInfoProps = {
  gameNightInfo: {
    date: string
    description: string
  }
}

export default function GameNightInfo({ gameNightInfo }: GameNightInfoProps) {
  const [glitchEffect, setGlitchEffect] = useState(false)

  // Format the date for display
  const gameNightDate = new Date(gameNightInfo.date)
  const formattedDate = format(gameNightDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(gameNightDate, "h:mm a")

  // Trigger glitch effect occasionally
  setTimeout(
    () => {
      setGlitchEffect(true)
      setTimeout(() => setGlitchEffect(false), 150)
    },
    Math.random() * 8000 + 5000,
  )

  // Create a plain text description for calendar by removing HTML tags
  const plainDescription = gameNightInfo.description.replace(/<[^>]*>?/gm, "")

  return (
    <div className="border-2 border-amber-700 bg-black/50 p-4">
      <div className={cn("text-center mb-2", glitchEffect ? "animate-textGlitch" : "")}>
        <h2 className="text-2xl font-bold text-yellow-500">NEXT GAME NIGHT</h2>
        <div className="mt-2 text-xl text-amber-400">
          {formattedDate} at {formattedTime}
        </div>

        {/* Calendar buttons */}
        <CalendarButtons date={gameNightInfo.date} description={plainDescription} />
      </div>

      <div className="mt-4 text-amber-300 bg-amber-900/20 p-3 border border-amber-700/50">
        <div
          dangerouslySetInnerHTML={{ __html: gameNightInfo.description }}
          className="prose prose-invert prose-amber max-w-none"
        />
      </div>
    </div>
  )
}
