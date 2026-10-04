<script setup lang="ts">
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";

definePageMeta({ layout: false });
useHead({ title: "Availability | Cally" });

const settings = useAvailabilitySettings();
const timezone = ref("");

onMounted(() => {
  timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
});

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
  <UiAppShell>
    <div class="mx-auto max-w-2xl">
      <UiAppPageHeader
        title="Availability"
        description="Set the weekly windows when guests can book time with you."
        class="mb-8"
      />

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
          <div
            class="ml-auto h-8 w-52 max-w-[45%] animate-pulse rounded bg-muted"
          />
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
        <SharedButton
          type="button"
          variant="outline"
          size="sm"
          @click="settings.query.refetch()"
        >
          Try again
        </SharedButton>
      </div>

      <UiAvailabilityForm
        v-else
        :availability="settings.availability.value"
        :day-errors="settings.dayErrors.value"
        :availability-error="settings.availabilityError.value"
        :timezone="timezone"
        :has-changes="settings.hasChanges.value"
        :saving="settings.saving.value"
        @toggle="settings.toggleDay"
        @add="settings.addRange"
        @remove="settings.removeRange"
        @update="settings.updateRange"
        @copy="settings.copyDay"
        @discard="settings.discard"
        @save="save"
      />
    </div>
  </UiAppShell>
</template>
