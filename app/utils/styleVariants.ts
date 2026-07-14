// Literal Tailwind class strings only - Tailwind's static scanner can't see
// class names built via template-string interpolation (e.g. `bg-${color}-600`).

export type UiColor = 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'
export type ButtonVariant = 'solid' | 'soft' | 'ghost' | 'outline'
export type UiSize = 'xs' | 'sm' | 'md' | 'lg'

const buttonColorVariants: Record<UiColor, Record<ButtonVariant, string>> = {
  brand: {
    solid: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60',
    outline: 'border border-brand-300 text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-900/40',
    ghost: 'text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/40'
  },
  info: {
    solid: 'bg-info-600 text-white hover:bg-info-700 focus-visible:outline-info-600',
    soft: 'bg-info-50 text-info-700 hover:bg-info-100 dark:bg-info-500/10 dark:text-info-500',
    outline: 'border border-info-500/40 text-info-700 hover:bg-info-50 dark:text-info-500',
    ghost: 'text-info-700 hover:bg-info-50 dark:text-info-500 dark:hover:bg-info-500/10'
  },
  success: {
    solid: 'bg-success-600 text-white hover:bg-success-700 focus-visible:outline-success-600',
    soft: 'bg-success-50 text-success-700 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-500',
    outline: 'border border-success-500/40 text-success-700 hover:bg-success-50 dark:text-success-500',
    ghost: 'text-success-700 hover:bg-success-50 dark:text-success-500 dark:hover:bg-success-500/10'
  },
  warning: {
    solid: 'bg-warning-600 text-white hover:bg-warning-700 focus-visible:outline-warning-600',
    soft: 'bg-warning-50 text-warning-700 hover:bg-warning-100 dark:bg-warning-500/10 dark:text-warning-500',
    outline: 'border border-warning-500/40 text-warning-700 hover:bg-warning-50 dark:text-warning-500',
    ghost: 'text-warning-700 hover:bg-warning-50 dark:text-warning-500 dark:hover:bg-warning-500/10'
  },
  danger: {
    solid: 'bg-danger-600 text-white hover:bg-danger-700 focus-visible:outline-danger-600',
    soft: 'bg-danger-50 text-danger-700 hover:bg-danger-100 dark:bg-danger-500/10 dark:text-danger-500',
    outline: 'border border-danger-500/40 text-danger-700 hover:bg-danger-50 dark:text-danger-500',
    ghost: 'text-danger-700 hover:bg-danger-50 dark:text-danger-500 dark:hover:bg-danger-500/10'
  },
  neutral: {
    solid: 'bg-ink-heading text-white hover:bg-ink focus-visible:outline-ink-heading dark:bg-surface dark:text-ink dark:hover:bg-muted',
    soft: 'bg-muted text-ink hover:bg-line-soft',
    outline: 'border border-line text-ink hover:bg-muted',
    ghost: 'text-ink-muted hover:bg-muted'
  }
}

const buttonSizes: Record<UiSize, string> = {
  xs: 'text-xs px-2 py-1 gap-1',
  sm: 'text-sm px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-3.5 py-2 gap-2',
  lg: 'text-base px-4 py-2.5 gap-2'
}

export function buttonClasses(color: UiColor, variant: ButtonVariant, size: UiSize) {
  return `rounded-btn ${buttonColorVariants[color][variant]} ${buttonSizes[size]}`
}

const badgeColorVariants: Record<UiColor, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-800',
  info: 'bg-info-50 text-info-700 ring-1 ring-inset ring-info-600/20 dark:bg-info-500/10 dark:text-info-500 dark:ring-info-500/20',
  success: 'bg-success-50 text-success-700 ring-1 ring-inset ring-success-600/20 dark:bg-success-500/10 dark:text-success-500 dark:ring-success-500/20',
  warning: 'bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-600/20 dark:bg-warning-500/10 dark:text-warning-500 dark:ring-warning-500/20',
  danger: 'bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-600/20 dark:bg-danger-500/10 dark:text-danger-500 dark:ring-danger-500/20',
  neutral: 'bg-muted text-ink-muted ring-1 ring-inset ring-line-strong/40'
}

export function badgeClasses(color: UiColor) {
  return `rounded-pill ${badgeColorVariants[color]}`
}

const iconWrapVariants: Record<UiColor, { wrap: string; icon: string }> = {
  brand: { wrap: 'bg-brand-50 ring-1 ring-brand-600/20 dark:bg-brand-900/40', icon: 'text-brand-600 dark:text-brand-400' },
  info: { wrap: 'bg-info-50 ring-1 ring-info-600/20 dark:bg-info-500/10', icon: 'text-info-600 dark:text-info-500' },
  success: { wrap: 'bg-success-50 ring-1 ring-success-600/20 dark:bg-success-500/10', icon: 'text-success-600 dark:text-success-500' },
  warning: { wrap: 'bg-warning-50 ring-1 ring-warning-600/20 dark:bg-warning-500/10', icon: 'text-warning-600 dark:text-warning-500' },
  danger: { wrap: 'bg-danger-50 ring-1 ring-danger-600/20 dark:bg-danger-500/10', icon: 'text-danger-600 dark:text-danger-500' },
  neutral: { wrap: 'bg-muted ring-1 ring-line-strong/40', icon: 'text-ink-muted' }
}

export function iconWrapClasses(color: UiColor) {
  return iconWrapVariants[color]
}
