'use client'

import React from 'react'

interface AvatarProps {
  src?: string | null
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  glow?: boolean
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-3xl',
}

export function Avatar({
  src,
  fallback = 'C',
  size = 'md',
  className = '',
  glow = false,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false)

  const sizeClass = sizeClasses[size] || sizeClasses.md

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold bg-neutral-900 border border-neutral-800 ${sizeClass} ${
        glow ? 'ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-500/20' : ''
      } ${className}`}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center text-neutral-950 font-black">
          {fallback[0]?.toUpperCase() || 'C'}
        </div>
      )}
    </div>
  )
}
