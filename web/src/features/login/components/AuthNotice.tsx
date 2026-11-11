import type { ReactNode } from 'react'
import { paths } from '../../../app/paths'
import { ButtonLink } from '../../../components/ui/ButtonLink'
import { AuthFrame } from './AuthFrame'

type AuthNoticeProps = {
  title: string
  children: ReactNode
}

export function AuthNotice({ title, children }: AuthNoticeProps) {
  return (
    <AuthFrame>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-8 pb-16">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl leading-heading">{title}</h1>
          <p className="text-sm leading-relaxed text-muted">{children}</p>
        </div>
        <ButtonLink to={paths.login} icon="arrowLeft" className="self-start">
          Back to log in
        </ButtonLink>
      </main>
    </AuthFrame>
  )
}
