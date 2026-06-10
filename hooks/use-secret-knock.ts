"use client"

import { useState, useCallback, useEffect, useRef } from "react"

// The secret password: spell out "GATE" by clicking letters in "Techie Game Night"
// G - from "Game"
// A - from "Game" 
// T - from "Techie" or "Night"
// E - from "Techie" (2x) or "Game"
const SECRET_PASSWORD = ["G", "A", "T", "E"]
const PATTERN_TIMEOUT = 3000 // Reset pattern if no click for 3 seconds
const SUCCESS_FEEDBACK_DURATION = 500

export function useSecretKnock() {
  const [currentSequence, setCurrentSequence] = useState<string[]>([])
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if the current sequence matches the password
  const checkPassword = useCallback((sequence: string[]) => {
    // Check if each letter matches (case insensitive)
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i].toUpperCase() !== SECRET_PASSWORD[i]) {
        return { matches: false, complete: false }
      }
    }
    
    return {
      matches: true,
      complete: sequence.length === SECRET_PASSWORD.length
    }
  }, [])

  const registerLetter = useCallback((letter: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setCurrentSequence(prev => {
      const newSequence = [...prev, letter.toUpperCase()]
      const result = checkPassword(newSequence)

      if (result.complete && result.matches) {
        // Success! Show feedback then unlock
        setShowFeedback(true)
        setTimeout(() => {
          setShowFeedback(false)
          setIsUnlocked(true)
        }, SUCCESS_FEEDBACK_DURATION)
        return []
      } else if (!result.matches) {
        // Wrong letter, reset the sequence
        return []
      }

      return newSequence
    })

    // Set timeout to reset pattern
    timeoutRef.current = setTimeout(() => {
      setCurrentSequence([])
    }, PATTERN_TIMEOUT)
  }, [checkPassword])

  const closeSecretBoard = useCallback(() => {
    setIsUnlocked(false)
    setCurrentSequence([])
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    registerLetter,
    isUnlocked,
    closeSecretBoard,
    showFeedback,
    progress: currentSequence.length,
    patternLength: SECRET_PASSWORD.length,
    currentSequence
  }
}
