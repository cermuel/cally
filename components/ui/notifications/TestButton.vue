<script setup lang="ts">
import { TestTube01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { getApiErrorMessage } from '~/utils/api/client'
import { notificationsApi } from '~/utils/api/notifications'

const client = useApiClient()

const testNotificationMutation = useMutation({
  mutationFn: () => notificationsApi.test(client),
  onError: (error) => {
    toast.error(getApiErrorMessage(error, 'Could not send a test notification.'))
  },
})
</script>

<template>
  <SharedButton
    variant="outline"
    size="sm"
    :loading="testNotificationMutation.isPending.value"
    @click="testNotificationMutation.mutate()"
  >
    <HugeiconsIcon
      :icon="TestTube01Icon"
      :size="16"
      :stroke-width="1.75"
      aria-hidden="true"
    />
    <span class="hidden sm:inline">Test notification</span>
    <span class="sr-only sm:hidden">Test notification</span>
  </SharedButton>
</template>
