"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { addBrianPlayer } from "@/app/actions"
import { cn } from "@/lib/utils"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full bg-emerald-900/50 border border-emerald-500 text-emerald-400 py-2 px-4 rounded",
        "hover:bg-emerald-800/50 focus:outline-none focus:ring-1 focus:ring-emerald-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors text-lg font-bold tracking-wider",
      )}
    >
      {pending ? "JOINING..." : "JOIN"}
    </button>
  )
}

export default function BrianAddPlayerForm() {
  const [name, setName] = useState("")
  const [games, setGames] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError("")
    setSuccess(false)

    const result = await addBrianPlayer(
      formData.get("name") as string, 
      formData.get("games") as string
    )

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
    <div className="border-2 border-emerald-700/50 bg-slate-800/50 rounded-lg p-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-emerald-400">CLAIM YOUR SPOT</h2>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/50 rounded p-2 animate-pulse">
            ERROR: {error}
          </div>
        )}

        {success && (
          <div className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-900/50 rounded p-2">
            WELCOME TO THE BASEMENT CREW!
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="brian-name" className="block text-emerald-300">
            YOUR NAME:
          </label>
          <input
            id="brian-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              "w-full bg-slate-900/50 border border-emerald-700/50 rounded",
              "text-emerald-400 p-2",
              "focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500",
              "placeholder:text-emerald-700"
            )}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="brian-games" className="block text-emerald-300">
            GAMES YOU&apos;LL BRING (OPTIONAL):
          </label>
          <input
            id="brian-games"
            name="games"
            value={games}
            onChange={(e) => setGames(e.target.value)}
            className={cn(
              "w-full bg-slate-900/50 border border-emerald-700/50 rounded",
              "text-emerald-400 p-2",
              "focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500",
              "placeholder:text-emerald-700"
            )}
            placeholder="Catan, Wingspan, etc."
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
