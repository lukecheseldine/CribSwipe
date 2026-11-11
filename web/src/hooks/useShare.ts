import { useEffect, useState } from 'react'

const COPIED_RESET_MS = 2000

/** Opens the system share sheet when there is one, otherwise copies the link. */
export function useShare() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_RESET_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const share = async (data: { title: string; url: string }) => {
    try {
      if (navigator.share) {
        await navigator.share(data)
      } else {
        await navigator.clipboard.writeText(data.url)
        setCopied(true)
      }
    } catch {
      // The user dismissed the share sheet, or clipboard access was denied.
    }
  }

  return { share, copied }
}
