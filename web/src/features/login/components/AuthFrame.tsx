import type { ReactNode } from 'react'
import { BrandLogo } from '../../../components/layout/BrandLogo'

type AuthFrameProps = {
  children: ReactNode
}

/** Login and the account pages that share its header, outside the app navigation. */
export function AuthFrame({ children }: AuthFrameProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between px-12 py-7">
        <BrandLogo />
        <p className="text-label text-muted">Your next chapter starts here.</p>
      </header>
      {children}
    </div>
  )
}
