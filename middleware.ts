import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the request is for the protected route
  if (request.nextUrl.pathname.startsWith("/game-night")) {
    // Get the authentication token from cookies
    const authToken = request.cookies.get("game-night-auth")?.value

    // If no token exists or it's invalid, redirect to the password page
    if (!authToken) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      // Verify the token (simple check for demo purposes)
      const tokenData = JSON.parse(Buffer.from(authToken, "base64").toString())
      const { expires } = tokenData

      // Check if token has expired
      if (Date.now() > expires) {
        // Token expired, redirect to login
        const response = NextResponse.redirect(new URL("/", request.url))
        response.cookies.delete("game-night-auth")
        return response
      }

      // Token is valid, allow access
      return NextResponse.next()
    } catch (error) {
      // Invalid token format, redirect to login
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("game-night-auth")
      return response
    }
  }

  // Allow access to other routes
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/game-night/:path*"],
}
