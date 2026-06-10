"use client"

import { Calendar, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

type CalendarButtonsProps = {
  date: string
  title?: string
  description?: string
  location?: string
  url?: string
  variant?: "amber" | "emerald"
}

export default function CalendarButtons({
  date,
  title = "Techie Game Night",
  description = "Join us for an exciting game night!",
  location = "Celtic Corner - Downtown Dartmouth",
  url = "https://v0-next-js-game-night-app.vercel.app/",
  variant = "amber",
}: CalendarButtonsProps) {
  // Parse the date
  const eventDate = new Date(date)

  // Set event duration (3 hours)
  const endDate = new Date(eventDate)
  endDate.setHours(eventDate.getHours() + 3)

  // Format for Google Calendar
  const googleStartDate = formatGoogleDate(eventDate)
  const googleEndDate = formatGoogleDate(endDate)

  // Format for Outlook
  const outlookStartDate = formatOutlookDate(eventDate)
  const outlookEndDate = formatOutlookDate(endDate)

  // Create full description with URL
  const fullDescription = `${description}\n\nGame night terminal: ${url}`

  // Generate calendar URLs
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${googleStartDate}%2F${googleEndDate}&details=${encodeURIComponent(fullDescription)}&location=${encodeURIComponent(location)}&text=${encodeURIComponent(title)}`

  const outlookUrl = `https://outlook.live.com/calendar/0/action/compose?allday=false&body=${encodeURIComponent(fullDescription)}&enddt=${outlookEndDate}&location=${encodeURIComponent(location)}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=${outlookStartDate}&subject=${encodeURIComponent(title)}`

  const office365Url = `https://outlook.office.com/calendar/0/action/compose?allday=false&body=${encodeURIComponent(fullDescription)}&enddt=${outlookEndDate}&location=${encodeURIComponent(location)}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=${outlookStartDate}&subject=${encodeURIComponent(title)}`

  const buttonStyles = variant === "emerald"
    ? "bg-emerald-900/30 border border-emerald-700 text-emerald-400 hover:bg-emerald-800/40 focus:ring-emerald-500"
    : "bg-amber-900/30 border border-amber-700 text-amber-500 hover:bg-amber-800/40 focus:ring-amber-500"

  return (
    <div className="flex justify-center space-x-3 mt-2">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "p-2 focus:outline-none focus:ring-1 transition-colors flex items-center gap-1 text-sm",
          buttonStyles,
        )}
        title="Add to Google Calendar"
      >
        <Calendar className="h-4 w-4" />
        <span>Google</span>
      </a>

      <a
        href={outlookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "p-2 focus:outline-none focus:ring-1 transition-colors flex items-center gap-1 text-sm",
          buttonStyles,
        )}
        title="Add to Outlook Calendar"
      >
        <Mail className="h-4 w-4" />
        <span>Outlook</span>
      </a>

      <a
        href={office365Url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "p-2 focus:outline-none focus:ring-1 transition-colors flex items-center gap-1 text-sm",
          buttonStyles,
        )}
        title="Add to Office 365 Calendar"
      >
        <Calendar className="h-4 w-4" />
        <span>Office 365</span>
      </a>
    </div>
  )
}

// Helper functions to format dates for different calendar services
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, "")
}

function formatOutlookDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0]
}
