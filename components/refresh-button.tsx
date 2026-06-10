"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { refreshData } from "@/app/actions"
import { cn } from "@/lib/utils"

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function handleRefresh() {
    setIsRefreshing(true)

    try {
      await refreshData()
      // Force a client-side refresh as well
      window.location.reload()
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={cn(
        "bg-amber-900/50 border border-amber-500 text-amber-500 px-3 py-1",
        "flex items-center gap-1 hover:bg-amber-800/50 focus:outline-none",
        "focus:ring-1 focus:ring-amber-500 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      aria-label="Refresh data"
    >
      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      {isRefreshing ? "REFRESHING..." : "REFRESH"}
    </button>
  )
}
