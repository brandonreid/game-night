"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { validatePassword } from "@/app/actions"
import { cn } from "@/lib/utils"

export default function PasswordScreen() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [glitchEffect, setGlitchEffect] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Random glitch effect
    const glitchInterval = setInterval(
      () => {
        setGlitchEffect(true)
        setTimeout(() => setGlitchEffect(false), 150)
      },
      Math.random() * 5000 + 2000,
    )

    return () => clearInterval(glitchInterval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsValidating(true)
    setError("")

    try {
      const result = await validatePassword(password)
      if (result.success) {
        router.push("/game-night")
      } else {
        setError("INVALID PASSWORD")
        setPassword("")
      }
    } catch (err) {
      setError("SYSTEM ERROR")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <div
        className={cn(
          "relative w-full max-w-md p-8 border-2 border-green-500 rounded overflow-hidden",
          "after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[1px] after:bg-green-500 after:opacity-50 after:animate-scanline",
          glitchEffect ? "animate-glitch" : "",
        )}
      >
        <div className="mb-8 text-center">
          <h1 className={cn("text-3xl font-bold tracking-wider mb-2", glitchEffect ? "animate-textGlitch" : "")}>
            GAME NIGHT TERMINAL
          </h1>
          <div className="h-[2px] w-full bg-green-500 opacity-75 mb-4"></div>
          <p className="text-sm opacity-80">AUTHORIZATION REQUIRED</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm">
              &gt; ENTER PASSWORD:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-green-500 text-green-500 p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
              autoComplete="off"
              disabled={isValidating}
            />
          </div>

          {error && <div className="text-red-500 text-sm animate-blink">&gt; ERROR: {error}</div>}

          <button
            type="submit"
            disabled={isValidating || !password}
            className={cn(
              "w-full bg-green-900 border border-green-500 text-green-500 py-2 px-4",
              "hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors",
            )}
          >
            {isValidating ? "PROCESSING..." : "ACCESS"}
          </button>
        </form>
      </div>
    </div>
  )
}
