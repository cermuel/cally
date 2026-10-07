<script setup lang="ts">
import { Notification01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '~/utils/api/query-keys'
import { usersApi } from '~/utils/api/users'

const auth = useAuth()
const client = useApiClient()
const profileQuery = useQuery({
  queryKey: queryKeys.auth.user(),
  queryFn: () => usersApi.me(client),
  enabled: computed(() => Boolean(auth.token.value)),
})
const notifications = useUnreadNotifications()

useNotificationRealtime()

watch(
  () => profileQuery.data.value?.user,
  (user) => {
    if (user) auth.setUser(user)
  },
  { immediate: true },
)

const label = computed(() => {
  const count = notifications.unreadCount.value

  return count === 0
    ? 'Notifications'
    : `${count} unread notification${count === 1 ? '' : 's'}`
})
</script>

<template>
  <SharedButton as-child variant="ghost" size="icon-sm">
    <NuxtLink
      to="/app/notifications"
      class="relative"
      :aria-label="label"
    >
      <HugeiconsIcon
        :icon="Notification01Icon"
        :size="20"
        :stroke-width="1.75"
        aria-hidden="true"
      />
      <span
        v-if="notifications.unreadCount.value > 0"
        class="absolute -end-0.5 -top-0.5 grid min-w-3.5 place-items-center rounded-full bg-destructive px-1 text-[9px] leading-3.5 font-semibold text-white ring-2 ring-background"
        aria-hidden="true"
      >
        {{ notifications.unreadCount.value > 99 ? "99+" : notifications.unreadCount.value }}
      </span>
    </NuxtLink>
  </SharedButton>
</template>
