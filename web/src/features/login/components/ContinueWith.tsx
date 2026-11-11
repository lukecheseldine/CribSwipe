import type { ReactNode } from 'react'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { AppleMark, GoogleMark } from './ProviderMarks'

type ContinueWithProps = {
  onUnavailable: () => void
}

export function ContinueWith({ onUnavailable }: ContinueWithProps) {
  return (
    <>
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or continue with
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ProviderButton mark={<AppleMark />} onClick={onUnavailable}>
          Apple
        </ProviderButton>
        <ProviderButton mark={<GoogleMark />} onClick={onUnavailable}>
          Google
        </ProviderButton>
      </div>
    </>
  )
}

type ProviderButtonProps = {
  mark: ReactNode
  children: string
  onClick: () => void
}

function ProviderButton({ mark, children, onClick }: ProviderButtonProps) {
  return (
    <button type="button" onClick={onClick} className={buttonClasses('secondary', 'w-full')}>
      {mark}
      {children}
    </button>
  )
}
