import { cn } from '../../lib/cn'

export type ButtonVariant = 'secondary' | 'primary' | 'destructive'

const variantClasses: Record<ButtonVariant, string> = {
  secondary: 'border-line bg-white text-ink hover:bg-canvas',
  primary: 'border-brand bg-brand text-white hover:bg-brand/90',
  destructive: 'border-line bg-white text-pass hover:bg-canvas',
}

export function buttonClasses(variant: ButtonVariant, className?: string) {
  return cn(
    'flex h-13 cursor-pointer items-center justify-center gap-2.5 rounded-full border px-5.5 text-sm font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    className
  )
}
