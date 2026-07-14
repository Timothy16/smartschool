import type { UiColor } from '~/utils/styleVariants'

export interface ToastItem {
  id: number
  title: string
  description?: string
  color?: UiColor
  icon?: string
}

let counter = 0

export function useToast() {
  const toasts = useState<ToastItem[]>('toasts', () => [])

  function add(toast: Omit<ToastItem, 'id'>) {
    const id = ++counter
    toasts.value.push({ id, ...toast })
    setTimeout(() => remove(id), 5000)
  }

  function remove(id: number) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  return { toasts, add, remove }
}
