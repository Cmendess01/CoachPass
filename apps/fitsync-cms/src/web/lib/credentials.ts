/** Máscaras de registro profissional. Valores já gravados fora do formato continuam válidos até serem editados. */

export function formatCref(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^0-9A-Z]/g, '')
  const digits = cleaned.match(/^\d{0,6}/)?.[0] ?? ''
  const rest = cleaned.slice(digits.length)
  const letter = rest.match(/^[A-Z]/)?.[0] ?? ''
  const uf = rest.slice(letter ? 1 : 0).replace(/[^A-Z]/g, '').slice(0, 2)
  if (!digits) return ''
  if (!letter) return digits
  if (!uf) return `${digits}-${letter}`
  return `${digits}-${letter}/${uf}`
}

export function isValidCref(value: string): boolean {
  return /^\d{4,6}-[A-Z]\/[A-Z]{2}$/.test(value.trim().toUpperCase())
}

export function formatCrn(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (!digits) return ''
  const region = digits.startsWith('10') ? '10' : digits.slice(0, 1)
  const number = digits.slice(region.length, region.length + 6)
  return number ? `CRN-${region} ${number}` : `CRN-${region}`
}

export function isValidCrn(value: string): boolean {
  return /^CRN-(?:[1-9]|10) \d{3,6}$/.test(value.trim().toUpperCase())
}

export function whatsappDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidWhatsapp(value: string): boolean {
  const digits = whatsappDigits(value)
  return digits.length === 10 || digits.length === 11
}
