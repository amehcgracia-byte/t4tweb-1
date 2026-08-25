const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

export function formatDisplayDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (match) {
    const [, year, month, day] = match
    return DISPLAY_DATE_FORMATTER.format(Date.UTC(Number(year), Number(month) - 1, Number(day), 12))
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : DISPLAY_DATE_FORMATTER.format(parsed)
}
