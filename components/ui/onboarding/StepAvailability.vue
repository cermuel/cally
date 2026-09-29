<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import SharedButton from "~/components/shared/button/Button.vue";

const ob = useOnboardingContext();
</script>

<template>
  <div class="space-y-5">
    <div class="max-h-[min(30rem,calc(100dvh-11rem))] overflow-y-auto">
      <UiAvailabilityEditor
        :availability="ob.availability"
        :day-errors="ob.dayErrors"
        :disabled="ob.submitting"
        @toggle="ob.toggleDay"
        @add="ob.addRange"
        @remove="ob.removeRange"
        @update="ob.updateRange"
        @copy="ob.copyDay"
      />
    </div>

    <div class="flex min-h-5 items-center justify-between gap-4 text-xs">
      <p
        v-if="ob.availabilityError"
        class="text-destructive"
        aria-live="polite"
      >
        {{ ob.availabilityError }}
      </p>
      <p v-else class="text-muted-foreground">Times use your local timezone.</p>
      <p v-if="ob.timezone" class="shrink-0 text-muted-foreground">
        {{ ob.timezone }}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <SharedButton
        type="button"
        variant="secondary"
        class="h-10"
        @click="ob.back"
        >Back</SharedButton
      >
      <SharedButton
        type="button"
        :disabled="!ob.canContinue || ob.submitting"
        :loading="ob.submitting"
        class="h-10 flex-1"
        @click="ob.next"
      >
        <HugeiconsIcon
          v-if="ob.submitting"
          :icon="Loading03Icon"
          :size="16"
          class="animate-spin"
        />
        {{ ob.submitting ? "Finishing up" : "Finish setup" }}
      </SharedButton>
    </div>
  </div>
</template>
