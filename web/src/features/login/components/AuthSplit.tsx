import type { ReactNode } from 'react'
import { AuthFrame } from './AuthFrame'
import { LoginPhoto } from './LoginPhoto'

type AuthSplitProps = {
  photo: string | null
  children: ReactNode
}

export function AuthSplit({ photo, children }: AuthSplitProps) {
  return (
    <AuthFrame>
      <main className="grid flex-1 grid-cols-2 items-stretch gap-16 px-12 pb-12">
        <LoginPhoto src={photo} />
        <div className="flex items-center">{children}</div>
      </main>
    </AuthFrame>
  )
}
