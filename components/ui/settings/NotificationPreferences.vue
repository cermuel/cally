<script setup lang="ts">
import { useMutation, useQuery } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_ITEMS,
} from '~/constants/notifications'
import type { NotificationPreferences } from '~/utils/api/auth'
import { getApiErrorMessage } from '~/utils/api/client'
import { queryKeys } from '~/utils/api/query-keys'
import { usersApi } from '~/utils/api/users'

const auth = useAuth()
const client = useApiClient()

const copyPreferences = (preferences: NotificationPreferences) => ({
  booking_created: { ...preferences.booking_created },
  booking_cancelled: { ...preferences.booking_cancelled },
  booking_rescheduled: { ...preferences.booking_rescheduled },
  guest_added: { ...preferences.guest_added },
})

const preferences = ref(copyPreferences(DEFAULT_NOTIFICATION_PREFERENCES))

const profileQuery = useQuery({
  queryKey: queryKeys.auth.user(),
  queryFn: () => usersApi.me(client),
})

watch(
  () => profileQuery.data.value?.user,
  (user) => {
    if (!user) return

    auth.setUser(user)
    preferences.value = copyPreferences(user.notification_preference)
  },
  { immediate: true },
)

const savedPreferences = computed(
  () => profileQuery.data.value?.user.notification_preference
    ?? auth.user.value?.notification_preference
    ?? DEFAULT_NOTIFICATION_PREFERENCES,
)

watch(
  savedPreferences,
  (value) => {
    preferences.value = copyPreferences(value)
  },
  { immediate: true },
)

const isDirty = computed(
  () => JSON.stringify(preferences.value) !== JSON.stringify(savedPreferences.value),
)

const saveMutation = useMutation({
  mutationFn: () => usersApi.editProfile(client, {
    notification_preference: preferences.value,
  }),
  onSuccess: (response) => {
    auth.setUser(response.user)
    profileQuery.refetch()
    toast.success('Notification preferences saved')
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(error, 'Could not save notification preferences.'))
  },
})

const resetMutation = useMutation({
  mutationFn: () => usersApi.editProfile(client, {
    notification_preference: null,
  }),
  onSuccess: (response) => {
    auth.setUser(response.user)
    preferences.value = copyPreferences(response.user.notification_preference)
    profileQuery.refetch()
    toast.success('Notification preferences reset')
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(error, 'Could not reset notification preferences.'))
  },
})

const busy = computed(
  () => saveMutation.isPending.value || resetMutation.isPending.value,
)
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-border bg-card">
    <div class="border-b border-border px-5 py-4 sm:px-6">
      <h2 class="font-medium">Notification preferences</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Choose how you hear about activity around your bookings.
      </p>
    </div>

    <div
      v-if="profileQuery.isPending.value"
      class="space-y-3 p-5 sm:p-6"
      aria-label="Loading notification preferences"
      aria-busy="true"
    >
      <div
        v-for="index in 4"
        :key="index"
        class="h-14 animate-pulse rounded-lg bg-muted/60"
      />
    </div>

    <div
      v-else-if="profileQuery.isError.value"
      class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <p class="text-sm text-destructive">
        {{ getApiErrorMessage(profileQuery.error.value, "Could not load notification preferences.") }}
      </p>
      <SharedButton type="button" size="sm" variant="outline" @click="profileQuery.refetch()">
        Try again
      </SharedButton>
    </div>

    <template v-else>
      <div class="hidden grid-cols-[minmax(0,1fr)_5rem_5rem] items-center gap-4 border-b border-border bg-muted/30 px-5 py-2.5 text-xs font-medium text-muted-foreground sm:grid sm:px-6">
        <span>Activity</span>
        <span class="text-center">In app</span>
        <span class="text-center">Email</span>
      </div>

      <div class="divide-y divide-border">
        <div
          v-for="item in NOTIFICATION_PREFERENCE_ITEMS"
          :key="item.key"
          class="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_5rem_5rem] sm:items-center sm:px-6"
        >
          <div>
            <h3 class="text-sm font-medium">{{ item.label }}</h3>
            <p class="mt-1 text-xs leading-5 text-muted-foreground">
              {{ item.description }}
            </p>
          </div>

          <div class="flex items-center justify-between gap-3 sm:justify-center">
            <span class="text-xs text-muted-foreground sm:sr-only">In app</span>
            <SharedSwitch
              :model-value="preferences[item.key].in_app"
              :disabled="busy"
              :aria-label="`${item.label} in-app notifications`"
              @update:model-value="preferences[item.key].in_app = $event"
            />
          </div>

          <div class="flex items-center justify-between gap-3 sm:justify-center">
            <span class="text-xs text-muted-foreground sm:sr-only">Email</span>
            <SharedSwitch
              :model-value="preferences[item.key].email"
              :disabled="busy"
              :aria-label="`${item.label} email notifications`"
              @update:model-value="preferences[item.key].email = $event"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col-reverse gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <SharedButton
          type="button"
          variant="ghost"
          :disabled="busy"
          @click="resetMutation.mutate()"
        >
          Reset to defaults
        </SharedButton>
        <SharedButton
          type="button"
          :loading="saveMutation.isPending.value"
          :disabled="!isDirty || busy"
          @click="saveMutation.mutate()"
        >
          Save preferences
        </SharedButton>
      </div>
    </template>
  </section>
</template>
