'use client'

import { useEffect, useRef } from 'react'

export type AdPlacement =
  | 'home-top'
  | 'home-bottom'
  | 'game-result'
  | 'truth-dare-bottom'
  | 'judge-feed'
  | 'rooms-hub'
  | 'results-bottom'
  | 'profile-bottom'
  | 'sidebar'

interface AdSlotProps {
  placement: AdPlacement
  format?: 'auto' | 'rectangle' | 'horizontal'
  className?: string
}

export function AdSlot({ placement, format = 'auto', className = '' }: AdSlotProps) {
  const publisherId =
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ||
    process.env.NEXT_PUBLIC_ADSENSE_PUB_ID

  const adsEnabled =
    process.env.NEXT_PUBLIC_ADS_ENABLED === 'true' &&
    Boolean(publisherId && publisherId.startsWith('ca-pub-'))

  const adLoadedRef = useRef(false)

  useEffect(() => {
    if (adsEnabled && !adLoadedRef.current && typeof window !== 'undefined') {
      try {
        ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
        adLoadedRef.current = true
      } catch {}
    }
  }, [adsEnabled])

  // If Ads are actively enabled and configured with verified ca-pub- ID
  if (adsEnabled && publisherId) {
    return (
      <div
        className={`w-full overflow-hidden flex items-center justify-center my-6 min-h-[90px] transition-opacity duration-300 ${className}`}
        aria-label="Advertisement"
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={placement}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    )
  }

  // If in Development/Staging and ads are not enabled, display clean non-intrusive dev placeholder
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`w-full max-w-2xl mx-auto my-6 p-4 rounded-2xl border border-neutral-800/60 bg-neutral-950/40 text-center flex flex-col items-center justify-center min-h-[90px] text-neutral-600 select-none ${className}`}
      >
        <span className="text-[10px] font-black tracking-widest uppercase">
          ADVERTISEMENT CONTAINER • {placement.toUpperCase()}
        </span>
        <span className="text-[9px] text-neutral-700 mt-0.5">
          Reserved non-intrusive slot (Google AdSense Ready)
        </span>
      </div>
    )
  }

  // In production with ads disabled: render nothing, zero empty layout shift
  return null
}
