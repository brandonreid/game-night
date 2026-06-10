"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/database.types"

// Create a Supabase client specifically for server actions
const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
}

// Password validation and authentication
export async function validatePassword(password: string) {
  // Simple server-side validation
  if (password === "halihax") {
    // Create an authentication token
    const token = {
      // Set expiration to 24 hours from now
      expires: Date.now() + 24 * 60 * 60 * 1000,
      // Add a random component for additional security
      random: Math.random().toString(36).substring(2, 15),
    }

    // Convert token to base64
    const tokenString = Buffer.from(JSON.stringify(token)).toString("base64")

    // Store token in cookies
    cookies().set("game-night-auth", tokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: "/",
      sameSite: "lax",
    })

    return { success: true }
  }
  return { success: false }
}

// Check if user is authenticated
export async function checkAuth() {
  const authToken = cookies().get("game-night-auth")?.value

  if (!authToken) {
    return false
  }

  try {
    const tokenData = JSON.parse(Buffer.from(authToken, "base64").toString())
    const { expires } = tokenData

    // Check if token has expired
    if (Date.now() > expires) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

// Logout function
export async function logout() {
  cookies().delete("game-night-auth")
  redirect("/")
}

// Player management
export async function addPlayer(name: string, games: string) {
  if (!name.trim()) {
    return { success: false, error: "Name is required" }
  }

  try {
    const supabase = createServerSupabaseClient()

    // Check if player already exists
    const { data: existingPlayer } = await supabase.from("players").select("id").eq("name", name).maybeSingle()

    if (existingPlayer) {
      return { success: false, error: "Player already registered" }
    }

    // Add new player
    const { error } = await supabase.from("players").insert({ name, games: games || null })

    if (error) throw error

    // Revalidate both the path and tag
    revalidatePath("/game-night")
    revalidateTag("players")
    return { success: true }
  } catch (error) {
    console.error("Error adding player:", error)
    return { success: false, error: "Failed to add player" }
  }
}

// New function to delete a player
export async function deletePlayer(playerId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Delete the player
    const { error } = await supabase.from("players").delete().eq("id", playerId)

    if (error) throw error

    // Revalidate both the path and tag
    revalidatePath("/game-night")
    revalidateTag("players")
    return { success: true }
  } catch (error) {
    console.error("Error deleting player:", error)
    return { success: false, error: "Failed to delete player" }
  }
}

export async function getPlayers() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: players, error } = await supabase
      .from("players")
      .select("*")
      .order("joined_at", { ascending: true })
      .returns<any[]>()

    if (error) throw error

    return players || []
  } catch (error) {
    console.error("Error getting players:", error)
    return []
  }
}

export async function getGameNightInfo() {
  try {
    const supabase = createServerSupabaseClient()

    // Get the active game night
    const { data: gameNight, error } = await supabase
      .from("game_nights")
      .select("*")
      .eq("is_active", true)
      .order("date", { ascending: true })
      .limit(1)
      .single()

    if (error) {
      // If no game night found, return default values
      if (error.code === "PGRST116") {
        return {
          date: "2025-05-21T19:00:00.000Z",
          description: "Join us for an exciting game night!",
        }
      }
      throw error
    }

    return {
      date: gameNight.date,
      description: gameNight.description || "Join us for an exciting game night!",
    }
  } catch (error) {
    console.error("Error getting game night info:", error)
    return {
      date: "2025-05-21T19:00:00.000Z",
      description: "Join us for an exciting game night!",
    }
  }
}

export async function sortPlayersIntoTables(players: any[]) {
  // Shuffle players using Fisher-Yates algorithm
  const shuffled = [...players]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // Distribute players into tables (ideally 4 per table)
  const tables: any[][] = []
  const totalPlayers = shuffled.length
  const idealTableSize = 4
  const minTableSize = 3
  const maxTableSize = 6

  // Calculate number of tables needed
  let numTables = Math.ceil(totalPlayers / idealTableSize)

  // Ensure we don't have tables smaller than minTableSize
  while (totalPlayers / numTables < minTableSize && numTables > 1) {
    numTables--
  }

  // Initialize tables
  for (let i = 0; i < numTables; i++) {
    tables.push([])
  }

  // Distribute players round-robin
  for (let i = 0; i < shuffled.length; i++) {
    const tableIndex = i % numTables
    tables[tableIndex].push(shuffled[i])
  }

  // Rebalance if any table exceeds maxTableSize
  let needsRebalancing = tables.some((table) => table.length > maxTableSize)
  while (needsRebalancing) {
    const largestTable = tables.reduce((max, table, i) => (table.length > tables[max].length ? i : max), 0)
    const smallestTable = tables.reduce((min, table, i) => (table.length < tables[min].length ? i : min), 0)

    if (tables[largestTable].length > maxTableSize && tables[largestTable].length - tables[smallestTable].length > 1) {
      // Move a player from largest to smallest table
      tables[smallestTable].push(tables[largestTable].pop()!)
    } else {
      needsRebalancing = false
    }
  }

  return tables
}

// New function to manually revalidate the cache
export async function refreshData() {
  revalidatePath("/game-night")
  revalidateTag("players")
  revalidateTag("game-night")
  return { success: true }
}

// ===============================
// Brian's Board Actions
// ===============================

export async function addBrianPlayer(name: string, games: string) {
  if (!name.trim()) {
    return { success: false, error: "Name is required" }
  }

  try {
    const supabase = createServerSupabaseClient()

    // Check if player already exists
    const { data: existingPlayer } = await supabase.from("brian_players").select("id").eq("name", name).maybeSingle()

    if (existingPlayer) {
      return { success: false, error: "Player already registered" }
    }

    // Add new player
    const { error } = await supabase.from("brian_players").insert({ name, games: games || null })

    if (error) throw error

    revalidatePath("/game-night")
    revalidateTag("brian-players")
    return { success: true }
  } catch (error) {
    console.error("Error adding Brian player:", error)
    return { success: false, error: "Failed to add player" }
  }
}

export async function deleteBrianPlayer(playerId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("brian_players").delete().eq("id", playerId)

    if (error) throw error

    revalidatePath("/game-night")
    revalidateTag("brian-players")
    return { success: true }
  } catch (error) {
    console.error("Error deleting Brian player:", error)
    return { success: false, error: "Failed to delete player" }
  }
}

export async function getBrianPlayers() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: players, error } = await supabase
      .from("brian_players")
      .select("*")
      .order("joined_at", { ascending: true })
      .returns<any[]>()

    if (error) throw error

    return players || []
  } catch (error) {
    console.error("Error getting Brian players:", error)
    return []
  }
}

export async function getBrianGameNightInfo() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: gameNight, error } = await supabase
      .from("brian_game_nights")
      .select("*")
      .eq("is_active", true)
      .order("date", { ascending: true })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return {
          date: "2025-05-28T19:00:00.000Z",
          description: "Board game night at Brian's place! His basement setup is legendary.",
        }
      }
      throw error
    }

    return {
      date: gameNight.date,
      description: gameNight.description || "Board game night at Brian's place!",
    }
  } catch (error) {
    console.error("Error getting Brian game night info:", error)
    return {
      date: "2025-05-28T19:00:00.000Z",
      description: "Board game night at Brian's place! His basement setup is legendary.",
    }
  }
}
