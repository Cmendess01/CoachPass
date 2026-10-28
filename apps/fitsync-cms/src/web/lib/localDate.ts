/** Data civil local, sem o deslocamento de `toISOString()` em `YYYY-MM-DD`. */

export function todayLocalDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function localDateInputValue(value: string | null | undefined): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value || '')
  return match?.[1] || todayLocalDate()
}

/** Meio-dia local: a conversão para UTC não muda o dia civil no Brasil. */
export function localDateToIso(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return value
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return new Date(year, month - 1, day, 12, 0, 0, 0).toISOString()
}

export function formatLocalDate(value: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '')
  if (!match) return value || ''
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
}
