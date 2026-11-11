export function FormNotice({ children }: { children: string }) {
  return (
    <p role="status" className="text-center text-xs text-muted">
      {children}
    </p>
  )
}
