export const cleanText = (value: unknown, max = 200): string =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

export const cleanMultiline = (value: unknown, max = 2000): string =>
  String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max)

export const cleanEmail = (value: unknown): string =>
  cleanText(value, 254).toLowerCase()

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const cleanPhone = (value: unknown): string =>
  cleanText(value, 40).replace(/[^\d+\-\s()]/g, '').slice(0, 32)

export const cleanUrl = (value: unknown, max = 2048): string =>
  cleanText(value, max)
