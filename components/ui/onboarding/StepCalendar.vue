<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Calendar03Icon,
  Loading03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import {
  CALENDAR_NOTES,
  CONNECTED_CALENDAR_ACCOUNT,
} from "~/constants/onboarding";
import SharedButton from "~/components/shared/button/Button.vue";

const ob = useOnboardingContext();
const GOOGLE_ICON = "/svg/google.svg";
</script>

<template>
  <div class="space-y-6">
    <SharedButton
      v-if="ob.calendar.connected"
      type="button"
      variant="outline"
      disabled
      class="min-h-14 w-full cursor-default! justify-start! opacity-100! gap-3 bg-white px-3 py-2 text-neutral-950 hover:bg-white dark:bg-white dark:text-neutral-950 dark:hover:bg-white"
    >
      <span
        class="grid shrink-0 place-items-center rounded-full border border-border bg-white"
      >
        <img :src="GOOGLE_ICON" alt="" class="size-5" />
      </span>

      <span class="min-w-0 flex-1 text-left">
        <span class="block truncate text-sm font-medium leading-5">
          {{ CONNECTED_CALENDAR_ACCOUNT.name }}
        </span>
        <span
          class="block truncate text-xs font-normal leading-4 text-muted-foreground"
        >
          {{ CONNECTED_CALENDAR_ACCOUNT.email }}
        </span>
      </span>

      <span
        class="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/5 text-xs font-medium text-green-700"
      >
        <HugeiconsIcon
          :icon="Tick02Icon"
          :size="10"
          color="green"
          :stroke-width="2.5"
          aria-hidden="true"
        />

        Connected
      </span>
    </SharedButton>

    <SharedButton
      v-else
      type="button"
      :disabled="ob.calendar.connecting"
      class="h-11 w-full"
      @click="ob.connectCalendar"
    >
      <HugeiconsIcon
        v-if="ob.calendar.connecting"
        :icon="Loading03Icon"
        :size="18"
        class="animate-spin"
        aria-hidden="true"
      />
      <img v-else :src="GOOGLE_ICON" alt="" class="size-4.5" />
      {{
        ob.calendar.connecting
          ? "Waiting for Google"
          : "Connect Google Calendar"
      }}
    </SharedButton>

    <ul class="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
      <li
        v-for="note in CALENDAR_NOTES"
        :key="note"
        class="flex items-start gap-3 text-[13px] leading-snug text-muted-foreground"
      >
        <HugeiconsIcon
          :icon="Calendar03Icon"
          :size="16"
          class="mt-px shrink-0 text-foreground"
        />
        {{ note }}
      </li>
    </ul>

    <div class="flex items-center justify-between gap-2">
      <SharedButton
        type="button"
        variant="secondary"
        class="h-10"
        @click="ob.back"
        >Back</SharedButton
      >

      <SharedButton
        type="button"
        class="h-10"
        :class="ob.calendar.connected && 'flex-1'"
        @click="ob.next"
      >
        {{ ob.calendar.connected ? "Continue" : "Skip" }}
      </SharedButton>
    </div>
  </div>
</template>
