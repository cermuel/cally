<script setup lang="ts">
import SharedButton from "~/components/shared/button/Button.vue";

const googleCalendar = useGoogleCalendar();
</script>

<template>
  <div class="p-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-base font-medium">Google Calendar</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Check for conflicts and add new bookings with a Google Meet link.
        </p>
      </div>

      <div v-if="googleCalendar.calendar.connected" class="flex items-center gap-3">
        <span
          class="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2 py-1 text-xs font-medium text-green-700"
        >
          Connected
        </span>
      </div>

      <SharedButton
        v-else
        type="button"
        variant="outline"
        :loading="googleCalendar.calendar.connecting"
        @click="googleCalendar.connect('/app/settings')"
      >
        <img src="/svg/google.svg" alt="" class="size-4.5" />
        Connect Google Calendar
      </SharedButton>
    </div>
  </div>
</template>
