// Local-time calendar key (YYYY-MM-DD). toISOString() would shift evening
// slots onto the next day for anyone west of UTC.
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// "Thursday, Oct 12 at 2:00 PM"
export function formatSessionDateTime(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  return `${day} at ${formatTime(date)}`;
}

export function formatDuration(duration: { min: number; max: number }): string {
  return duration.min === duration.max ? `${duration.max}-minute` : `${duration.min}–${duration.max} minute`;
}
