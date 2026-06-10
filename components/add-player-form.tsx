"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { addPlayer } from "@/app/actions"
import { cn } from "@/lib/utils"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full bg-amber-900/50 border border-amber-500 text-amber-500 py-2 px-4",
        "hover:bg-amber-800/50 focus:outline-none focus:ring-1 focus:ring-amber-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors text-lg font-bold tracking-wider",
      )}
    >
      {pending ? "PROCESSING..." : "JOIN"}
    </button>
  )
}

export default function AddPlayerForm() {
  const [name, setName] = useState("")
  const [games, setGames] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError("")
    setSuccess(false)

    const result = await addPlayer(formData.get("name") as string, formData.get("games") as string)

    if (result.success) {
      setName("")
      setGames("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to add player")
    }
  }

  return (
    <div className="border-2 border-amber-700 bg-black/50 p-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-yellow-500">REGISTER FOR GAME NIGHT</h2>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-500 text-sm bg-red-900/20 border border-red-900 p-2 animate-pulse">
            ERROR: {error}
          </div>
        )}

        {success && (
          <div className="text-green-500 text-sm bg-green-900/20 border border-green-900 p-2">
            PLAYER ADDED SUCCESSFULLY!
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="block text-amber-400">
            YOUR NAME:
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black border border-amber-700 text-amber-500 p-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="games" className="block text-amber-400">
            GAMES YOU'LL BRING (OPTIONAL):
          </label>
          <input
            id="games"
            name="games"
            value={games}
            onChange={(e) => setGames(e.target.value)}
            className="w-full bg-black border border-amber-700 text-amber-500 p-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
