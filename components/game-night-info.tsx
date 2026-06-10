"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Pencil } from "lucide-react"
import { updateGameNightDate } from "@/app/actions"
import CalendarButtons from "./calendar-buttons"
import GameNightDateEditor from "./game-night-date-editor"

type GameNightInfoProps = {
  gameNightInfo: {
    date: string
    description: string
  }
}

export default function GameNightInfo({ gameNightInfo }: GameNightInfoProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Format the date for display
  const gameNightDate = new Date(gameNightInfo.date)
  const formattedDate = format(gameNightDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(gameNightDate, "h:mm a")

  // Create a plain text description for calendar by removing HTML tags
  const plainDescription = gameNightInfo.description.replace(/<[^>]*>?/gm, "")

  return (
    <div className="relative border-2 border-amber-700 bg-black/50 p-4">
      {/* Edit toggle — overlays the date section with an inline date picker */}
      {!isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-2 p-1.5 text-amber-500/70 hover:text-amber-300 hover:bg-amber-900/30 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
          aria-label="Edit game night date"
          title="Edit date"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-yellow-500">NEXT GAME NIGHT</h2>

        {isEditing ? (
          <GameNightDateEditor
            date={gameNightInfo.date}
            variant="amber"
            onSave={updateGameNightDate}
            onClose={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className="mt-2 text-xl text-amber-400">
              {formattedDate} at {formattedTime}
            </div>

            {/* Calendar buttons */}
            <CalendarButtons date={gameNightInfo.date} description={plainDescription} />
          </>
        )}
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
