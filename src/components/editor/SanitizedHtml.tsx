'use client'

import { useMemo } from 'react'

interface SanitizedHtmlProps {
  html: string
  className?: string
}

export function SanitizedHtml({ html, className }: SanitizedHtmlProps) {
  const sanitized = useMemo(() => {
    if (typeof window === 'undefined') return html
    const temp = document.createElement('div')
    temp.innerHTML = html
    const scripts = temp.querySelectorAll('script, embed, object')
    scripts.forEach((el) => el.remove())
    const iframes = temp.querySelectorAll('iframe')
    iframes.forEach((el) => {
      const src = el.getAttribute('src') || ''
      if (!src.includes('youtube.com') && !src.includes('youtube-nocookie.com')) {
        el.remove()
      }
    })
    const all = temp.querySelectorAll('*')
    all.forEach((el) => {
      ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown'].forEach((attr) => {
        el.removeAttribute(attr)
      })
    })
    return temp.innerHTML
  }, [html])

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />
}
