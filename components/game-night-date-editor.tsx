"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Check, X, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type Variant = "amber" | "emerald"

type GameNightDateEditorProps = {
  date: string
  variant?: Variant
  onSave: (isoDate: string) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

// The stock shadcn Calendar relies on shadcn theme CSS variables (--primary,
// --accent, --border…) which this app never defines, so we override every
// relevant slot with explicit colors to keep the picker legible and on-theme.
const accents: Record<
  Variant,
  {
    wrapper: string
    heading: string
    button: string
    saveButton: string
    cancelButton: string
    input: string
    calendar: Record<string, string>
  }
> = {
  amber: {
    wrapper: "border-amber-700 bg-black/60",
    heading: "text-yellow-500",
    button:
      "border border-amber-700 text-amber-400 hover:bg-amber-800/40 focus:ring-amber-500",
    saveButton:
      "bg-amber-600 text-black hover:bg-amber-500 focus:ring-amber-400",
    cancelButton:
      "border border-amber-700 text-amber-400 hover:bg-amber-800/40 focus:ring-amber-500",
    input:
      "bg-black/60 border border-amber-700 text-amber-300 focus:ring-amber-500",
    calendar: {
      caption_label: "text-sm font-medium text-yellow-500",
      nav_button:
        "border border-amber-700 text-amber-400 hover:bg-amber-800/40",
      weekday: "text-amber-500/70 rounded-md w-9 font-normal text-[0.8rem]",
      day_button:
        "text-amber-200 hover:bg-amber-800/40 hover:text-amber-100 aria-selected:opacity-100",
      selected:
        "bg-amber-500 text-black hover:bg-amber-500 hover:text-black focus:bg-amber-500 focus:text-black",
      today: "border border-amber-600 text-amber-300",
    },
  },
  emerald: {
    wrapper: "border-emerald-700/50 bg-slate-900/70",
    heading: "text-emerald-400",
    button:
      "border border-emerald-700 text-emerald-400 hover:bg-emerald-800/40 focus:ring-emerald-500",
    saveButton:
      "bg-emerald-600 text-black hover:bg-emerald-500 focus:ring-emerald-400",
    cancelButton:
      "border border-emerald-700 text-emerald-400 hover:bg-emerald-800/40 focus:ring-emerald-500",
    input:
      "bg-slate-900/70 border border-emerald-700 text-emerald-200 focus:ring-emerald-500",
    calendar: {
      caption_label: "text-sm font-medium text-emerald-400",
      nav_button:
        "border border-emerald-700 text-emerald-400 hover:bg-emerald-800/40",
      weekday: "text-emerald-400/60 rounded-md w-9 font-normal text-[0.8rem]",
      day_button:
        "text-emerald-200 hover:bg-emerald-800/40 hover:text-emerald-100 aria-selected:opacity-100",
      selected:
        "bg-emerald-500 text-black hover:bg-emerald-500 hover:text-black focus:bg-emerald-500 focus:text-black",
      today: "border border-emerald-600 text-emerald-300",
    },
  },
}

export default function GameNightDateEditor({
  date,
  variant = "amber",
  onSave,
  onClose,
}: GameNightDateEditorProps) {
  const initial = new Date(date)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(initial)
  const [time, setTime] = useState(format(initial, "HH:mm"))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const a = accents[variant]

  const handleSave = async () => {
    if (!selectedDay) {
      setError("Pick a date")
      return
    }
    setSaving(true)
    setError(null)

    const [hours, minutes] = time.split(":").map((n) => Number.parseInt(n, 10))
    const combined = new Date(selectedDay)
    combined.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0)

    const result = await onSave(combined.toISOString())
    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Failed to save")
      setSaving(false)
    }
  }

  const sharedButton =
    "px-3 py-1.5 text-sm flex items-center gap-1 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className={cn("mt-2 border p-3 text-left", a.wrapper)}>
      <div className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={setSelectedDay}
          defaultMonth={initial}
          classNames={{
            caption_label: a.calendar.caption_label,
            button_previous: cn(
              "size-7 inline-flex items-center justify-center rounded p-0 opacity-70 hover:opacity-100",
              a.calendar.nav_button,
            ),
            button_next: cn(
              "size-7 inline-flex items-center justify-center rounded p-0 opacity-70 hover:opacity-100",
              a.calendar.nav_button,
            ),
            weekday: a.calendar.weekday,
            day_button: cn(
              "size-9 p-0 font-normal rounded-md inline-flex items-center justify-center transition-colors",
              a.calendar.day_button,
            ),
            selected: a.calendar.selected,
            today: a.calendar.today,
            outside: "opacity-30",
            disabled: "opacity-30",
          }}
        />

        <div className="mt-2 flex w-full items-center justify-center gap-2">
          <label className={cn("text-sm", a.heading)}>Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={cn(
              "px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 [color-scheme:dark]",
              a.input,
            )}
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(sharedButton, a.saveButton)}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={cn(sharedButton, a.cancelButton)}
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  )
}
