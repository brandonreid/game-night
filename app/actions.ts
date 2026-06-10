"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db, toPlainRows, type Player } from "@/lib/db"

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
    // Check if player already exists
    const existing = await db.execute({
      sql: "SELECT id FROM players WHERE name = ? LIMIT 1",
      args: [name],
    })

    if (existing.rows.length > 0) {
      return { success: false, error: "Player already registered" }
    }

    // Add new player
    await db.execute({
      sql: "INSERT INTO players (name, games) VALUES (?, ?)",
      args: [name, games || null],
    })

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
    // Delete the player
    await db.execute({
      sql: "DELETE FROM players WHERE id = ?",
      args: [playerId],
    })

    // Revalidate both the path and tag
    revalidatePath("/game-night")
    revalidateTag("players")
    return { success: true }
  } catch (error) {
    console.error("Error deleting player:", error)
    return { success: false, error: "Failed to delete player" }
  }
}

// Delete every registered player at once
export async function deleteAllPlayers() {
  try {
    await db.execute("DELETE FROM players")

    revalidatePath("/game-night")
    revalidateTag("players")
    return { success: true }
  } catch (error) {
    console.error("Error deleting all players:", error)
    return { success: false, error: "Failed to delete players" }
  }
}

export async function getPlayers() {
  try {
    const result = await db.execute("SELECT * FROM players ORDER BY joined_at ASC")
    return toPlainRows<Player>(result)
  } catch (error) {
    console.error("Error getting players:", error)
    return []
  }
}

export async function getGameNightInfo() {
  try {
    // Get the active game night
    const { rows } = await db.execute(
      "SELECT * FROM game_nights WHERE is_active = 1 ORDER BY date ASC LIMIT 1",
    )

    // If no game night found, return default values
    if (rows.length === 0) {
      return {
        date: "2025-05-21T19:00:00.000Z",
        description: "Join us for an exciting game night!",
      }
    }

    const gameNight = rows[0] as unknown as { date: string; description: string | null }
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

export async function updateGameNightDate(date: string) {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return { success: false, error: "Invalid date" }
  }

  try {
    const result = await db.execute({
      sql: "UPDATE game_nights SET date = ? WHERE is_active = 1",
      args: [date],
    })

    // No active game night yet — seed one so the board has something to show.
    if (result.rowsAffected === 0) {
      await db.execute({
        sql: "INSERT INTO game_nights (date, description, is_active) VALUES (?, ?, 1)",
        args: [date, "Join us for an exciting game night!"],
      })
    }

    revalidatePath("/game-night")
    revalidateTag("game-night")
    return { success: true }
  } catch (error) {
    console.error("Error updating game night date:", error)
    return { success: false, error: "Failed to update date" }
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
    // Check if player already exists
    const existing = await db.execute({
      sql: "SELECT id FROM brian_players WHERE name = ? LIMIT 1",
      args: [name],
    })

    if (existing.rows.length > 0) {
      return { success: false, error: "Player already registered" }
    }

    // Add new player
    await db.execute({
      sql: "INSERT INTO brian_players (name, games) VALUES (?, ?)",
      args: [name, games || null],
    })

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
    await db.execute({
      sql: "DELETE FROM brian_players WHERE id = ?",
      args: [playerId],
    })

    revalidatePath("/game-night")
    revalidateTag("brian-players")
    return { success: true }
  } catch (error) {
    console.error("Error deleting Brian player:", error)
    return { success: false, error: "Failed to delete player" }
  }
}

export async function deleteAllBrianPlayers() {
  try {
    await db.execute("DELETE FROM brian_players")

    revalidatePath("/game-night")
    revalidateTag("brian-players")
    return { success: true }
  } catch (error) {
    console.error("Error deleting all Brian players:", error)
    return { success: false, error: "Failed to delete players" }
  }
}

export async function getBrianPlayers() {
  try {
    const result = await db.execute("SELECT * FROM brian_players ORDER BY joined_at ASC")
    return toPlainRows<Player>(result)
  } catch (error) {
    console.error("Error getting Brian players:", error)
    return []
  }
}

export async function updateBrianGameNightDate(date: string) {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return { success: false, error: "Invalid date" }
  }

  try {
    const result = await db.execute({
      sql: "UPDATE brian_game_nights SET date = ? WHERE is_active = 1",
      args: [date],
    })

    if (result.rowsAffected === 0) {
      await db.execute({
        sql: "INSERT INTO brian_game_nights (date, description, is_active) VALUES (?, ?, 1)",
        args: [date, "Board game night at Brian's place! His basement setup is legendary."],
      })
    }

    revalidatePath("/game-night")
    revalidateTag("brian-game-night")
    return { success: true }
  } catch (error) {
    console.error("Error updating Brian game night date:", error)
    return { success: false, error: "Failed to update date" }
  }
}

export async function getBrianGameNightInfo() {
  try {
    const { rows } = await db.execute(
      "SELECT * FROM brian_game_nights WHERE is_active = 1 ORDER BY date ASC LIMIT 1",
    )

    if (rows.length === 0) {
      return {
        date: "2025-05-28T19:00:00.000Z",
        description: "Board game night at Brian's place! His basement setup is legendary.",
      }
    }

    const gameNight = rows[0] as unknown as { date: string; description: string | null }
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
