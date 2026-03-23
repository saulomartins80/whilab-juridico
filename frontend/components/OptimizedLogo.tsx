import Image from 'next/image'
import Link from 'next/link'
import { dashboardBranding } from '../config/branding'

interface OptimizedLogoProps {
  size?: number
  showText?: boolean
  href?: string
  className?: string
  textClassName?: string
  imageClassName?: string
  gapClassName?: string
}

export default function OptimizedLogo({
  size = 36,
  showText = false,
  href = '/',
  className = '',
  textClassName = '',
  imageClassName = '',
  gapClassName = 'gap-3',
}: OptimizedLogoProps) {
  const logoContent = (
    <div className={`flex items-center ${gapClassName} ${className}`}>
      <Image
        src="/logo.svg"
        alt={dashboardBranding.logoAlt}
        width={size}
        height={size}
        priority
        className={imageClassName}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
      {showText && (
        <span className={`font-semibold text-slate-900 dark:text-white ${textClassName}`}>
          {dashboardBranding.brandName}
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{logoContent}</Link>
  }

  return logoContent
}
