<script setup lang="ts">
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";

const settings = useAvailabilitySettings();

const save = () => {
  toast.promise(settings.save(), {
    loading: "Saving availability...",
    success: "Availability updated",
    error: (error) =>
      getApiErrorMessage(error, "Could not update your availability."),
  });
};
</script>

<template>
  <div
    v-if="settings.query.isPending.value"
    class="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
    aria-label="Loading availability"
    aria-busy="true"
  >
    <div
      v-for="index in 7"
      :key="index"
      class="flex items-center gap-4 px-4 py-4"
    >
      <div class="h-5 w-10 animate-pulse rounded-full bg-muted" />
      <div class="h-4 w-20 animate-pulse rounded bg-muted" />
      <div class="ml-auto h-8 w-52 max-w-[45%] animate-pulse rounded bg-muted" />
    </div>
  </div>

  <div
    v-else-if="settings.query.isError.value"
    role="alert"
    class="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
  >
    <p class="text-sm text-destructive">
      {{
        getApiErrorMessage(
          settings.query.error.value,
          "Could not load your availability.",
        )
      }}
    </p>
    <SharedButton type="button" variant="outline" size="sm" @click="settings.query.refetch()">
      Try again
    </SharedButton>
  </div>

  <div v-else class="overflow-hidden rounded-xl border border-border bg-card">
    <UiAvailabilityEditor
      :availability="settings.availability.value"
      :day-errors="settings.dayErrors.value"
      :disabled="settings.saving.value"
      class="rounded-none border-0"
      @toggle="settings.toggleDay"
      @add="settings.addRange"
      @remove="settings.removeRange"
      @update="settings.updateRange"
      @copy="settings.copyDay"
    />

    <footer
      class="flex flex-col gap-3 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div class="min-w-0 text-xs" aria-live="polite">
        <p v-if="settings.availabilityError.value" class="text-destructive">
          {{ settings.availabilityError.value }}
        </p>
        <p v-else class="text-muted-foreground">
          Times use your local timezone<span v-if="settings.timezone.value"
            >: {{ settings.timezone.value }}</span
          >.
        </p>
      </div>
      <div class="flex shrink-0 justify-end gap-2">
        <SharedButton
          v-if="settings.hasChanges.value && !settings.saving.value"
          type="button"
          variant="ghost"
          @click="settings.discard"
        >
          Discard
        </SharedButton>
        <SharedButton
          type="button"
          :disabled="!settings.hasChanges.value || !!settings.availabilityError.value"
          :loading="settings.saving.value"
          @click="save"
        >
          Save changes
        </SharedButton>
      </div>
    </footer>
  </div>
</template>
