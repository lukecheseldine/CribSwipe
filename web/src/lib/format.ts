export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function pluralize(count: number, noun: string) {
  return `${count.toLocaleString('en-CA')} ${noun}${count === 1 ? '' : 's'}`
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
