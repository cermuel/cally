const REMINDER_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000

export type TwoFactorReminder = 'prompt' | 'card'

export function useTwoFactorReminder(reminder: TwoFactorReminder) {
  const auth = useAuth()
  const mounted = ref(false)
  const lastShownAt = ref<number | null>(null)

  const storageKey = computed(() =>
    auth.user.value ? `cally-2fa-${reminder}:${auth.user.value.id}` : null,
  )

  const readLastShownAt = () => {
    if (!storageKey.value) return

    try {
      const stored = Number(localStorage.getItem(storageKey.value))
      lastShownAt.value = stored > 0 ? stored : null
    } catch {
      lastShownAt.value = null
    }
  }

  onMounted(() => {
    readLastShownAt()
    mounted.value = true
  })

  watch(storageKey, () => {
    if (mounted.value) readLastShownAt()
  })

  const due = computed(
    () =>
      mounted.value
      && auth.authState.value === 'authenticated'
      && auth.user.value?.two_factor_enabled === false
      && (lastShownAt.value === null
        || Date.now() - lastShownAt.value >= REMINDER_INTERVAL_MS),
  )

  const snooze = () => {
    lastShownAt.value = Date.now()

    if (!storageKey.value) return

    try {
      localStorage.setItem(storageKey.value, String(lastShownAt.value))
    } catch {}
  }

  return { due, snooze }
}
