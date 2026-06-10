import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

// This is a secret key to prevent unauthorized revalidation
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "default-secret-key"

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")

  // Check for the secret to prevent unauthorized revalidations
  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 })
  }

  // Get the path to revalidate (default to game-night)
  const path = request.nextUrl.searchParams.get("path") || "/game-night"

  // Revalidate the path and tags
  revalidatePath(path)
  revalidateTag("players")
  revalidateTag("game-night")

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    path,
  })
}
