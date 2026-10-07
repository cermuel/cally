import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toast } from 'vue-sonner'
import {
  notificationsApi,
  type Notification,
  type NotificationListParams,
} from '~/utils/api/notifications'
import { queryKeys } from '~/utils/api/query-keys'

type NotificationCreatedEvent = {
  notification: Notification
}

function openNotificationAction(actionUrl: string) {
  const destination = new URL(actionUrl, window.location.origin)

  if (!['http:', 'https:'].includes(destination.protocol)) {
    return
  }

  if (destination.origin === window.location.origin) {
    void navigateTo(`${destination.pathname}${destination.search}${destination.hash}`)
    return
  }

  void navigateTo(destination.toString(), { external: true })
}

export function useNotificationList(params: MaybeRefOrGetter<NotificationListParams>) {
  const client = useApiClient()
  const resolvedParams = computed(() => toValue(params))

  return useQuery({
    queryKey: computed(() => queryKeys.notifications.list(resolvedParams.value)),
    queryFn: () => notificationsApi.list(client, resolvedParams.value),
    placeholderData: keepPreviousData,
  })
}

export function useUnreadNotifications() {
  const auth = useAuth()
  const client = useApiClient()
  const query = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsApi.unreadCount(client),
    enabled: computed(() => Boolean(auth.user.value?.id)),
  })

  return {
    ...query,
    unreadCount: computed(() => query.data.value?.count ?? 0),
  }
}

export function useNotificationRealtime() {
  const auth = useAuth()
  const config = useRuntimeConfig()
  const queryClient = useQueryClient()

  watch(
    [() => auth.user.value?.id, () => auth.token.value],
    async ([userId, token], _, onCleanup) => {
      if (!import.meta.client || !userId || !token || !config.public.reverbAppKey) {
        return
      }

      let disposed = false
      let echo: { leave: (channel: string) => void, disconnect: () => void } | null = null
      const channelName = `users-${userId}-notifications`

      onCleanup(() => {
        disposed = true
        echo?.leave(channelName)
        echo?.disconnect()
      })

      const [{ default: Echo }, { default: Pusher }] = await Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ])

      if (disposed) {
        return
      }

      const scheme = config.public.reverbScheme || 'https'
      const apiBaseUrl = config.public.apiBaseUrl
        ? String(config.public.apiBaseUrl).replace(/\/$/, '')
        : ''
      const port = Number(config.public.reverbPort || (scheme === 'https' ? 443 : 80))

      ;(window as typeof window & { Pusher: typeof Pusher }).Pusher = Pusher

      const connection = new Echo({
        broadcaster: 'reverb',
        key: config.public.reverbAppKey,
        wsHost: config.public.reverbHost || window.location.hostname,
        wsPort: port,
        wssPort: port,
        forceTLS: scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiBaseUrl}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      })

      echo = connection
      connection
        .private(channelName)
        .subscribed(() => {
          console.info(`[notifications] Subscribed to ${channelName}`)
          toast.dismiss('notification-realtime-error')
        })
        .error((error: unknown) => {
          console.error(`[notifications] Could not subscribe to ${channelName}`, error)
          toast.error('Live notifications unavailable', {
            id: 'notification-realtime-error',
            description: 'New notifications will appear after you refresh.',
          })
        })
        .listen('.notification.created', (event: NotificationCreatedEvent) => {
          const { notification } = event
          const actionUrl = notification.action_url

          toast(notification.title, {
            id: `notification-${notification.id}`,
            description: notification.message ?? undefined,
            ...(actionUrl
              ? {
                  action: {
                    label: 'View',
                    onClick: () => openNotificationAction(actionUrl),
                  },
                }
              : {}),
          })

          void queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.lists(),
          })
          void queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.unreadCount(),
          })
        })
    },
    { immediate: true },
  )
}
