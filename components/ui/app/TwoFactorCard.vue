<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const { due, snooze } = useTwoFactorReminder("card");
</script>

<template>
  <Transition
    enter-active-class="transition-[opacity,transform] duration-200 ease-out"
    enter-from-class="translate-y-1 opacity-0"
    leave-active-class="transition-[opacity,transform] duration-150 ease-out"
    leave-to-class="translate-y-1 opacity-0"
  >
    <section
      v-if="due"
      aria-labelledby="two-factor-card-title"
      class="mb-3 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div class="flex items-start justify-between gap-3">
        <h2 id="two-factor-card-title" class="text-sm font-medium">
          Enable 2FA
        </h2>
        <SharedButton
          variant="ghost"
          size="icon-xs"
          class="-me-1 -mt-0.5 rounded-full border border-border"
          aria-label="Dismiss two-factor reminder"
          @click="snooze"
        >
          <HugeiconsIcon
            :icon="Cancel01Icon"
            :size="12"
            :stroke-width="2"
            aria-hidden="true"
          />
        </SharedButton>
      </div>
      <p class="mt-1.5 text-xs/5 text-muted-foreground">
        Protect your account from unauthorized access with two-factor
        authentication.
      </p>
      <SharedButton as-child size="sm" class="mt-3 w-full">
        <NuxtLink to="/app/settings?tab=account">Enable 2FA</NuxtLink>
      </SharedButton>
    </section>
  </Transition>
</template>
