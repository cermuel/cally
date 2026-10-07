<script setup lang="ts">
import {
  CheckmarkCircle02Icon,
  Download01Icon,
  AlertCircleIcon,
  Loading03Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type {
  ContactImport,
  ContactImportStatus,
} from "~/utils/api/contacts";

const props = defineProps<{
  contactImport: ContactImport;
  cancelling?: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  review: [];
}>();

const expanded = ref(false);
const active = computed(() =>
  ["pending", "processing"].includes(props.contactImport.status),
);
const progress = computed(() => {
  if (props.contactImport.total_rows <= 0) return 0;
  return Math.min(
    100,
    Math.round(
      (props.contactImport.processed_rows / props.contactImport.total_rows) * 100,
    ),
  );
});
const statusLabel = computed<Record<ContactImportStatus, string>>(() => ({
  pending: "Preparing contact import…",
  processing: `Importing contacts · ${progress.value}%`,
  completed: "Contact import completed",
  failed: "Contact import failed",
}));
const errorCount = computed(() => props.contactImport.errors.length);
const errorSummary = computed(() => {
  if (!errorCount.value) return "No errors were found";
  return `${errorCount.value} ${errorCount.value === 1 ? "row needs" : "rows need"} review`;
});
</script>

<template>
  <aside
    class="fixed inset-x-4 bottom-4 z-40 w-auto max-w-sm rounded-xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur sm:inset-e-6 sm:inset-s-auto sm:w-96"
    aria-live="polite"
  >
    <div class="flex items-start gap-3">
      <span
        class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
        :class="active ? 'bg-primary/10 text-primary' : contactImport.status === 'failed' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600'"
      >
        <HugeiconsIcon
          :icon="active ? Loading03Icon : contactImport.status === 'failed' ? AlertCircleIcon : CheckmarkCircle02Icon"
          :size="17"
          :stroke-width="1.75"
          :class="active && 'animate-spin'"
          aria-hidden="true"
        />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">{{ statusLabel[contactImport.status] }}</p>
        <p class="mt-1 text-xs text-muted-foreground">
          {{ contactImport.imported_rows }} uploaded · {{ contactImport.skipped_rows }} skipped
        </p>
      </div>
    </div>

    <div v-if="active" class="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
      <div class="h-full rounded-full bg-primary transition-[width] duration-300" :style="{ width: `${progress}%` }" />
    </div>

    <div v-if="active" class="mt-3 flex items-center justify-between gap-3">
      <p class="text-xs text-muted-foreground">
        <template v-if="contactImport.total_rows">
          {{ contactImport.processed_rows }} of {{ contactImport.total_rows }} processed
        </template>
        <template v-else>Waiting to start</template>
      </p>
      <SharedButton
        type="button"
        variant="ghost"
        size="xs"
        class="text-destructive hover:bg-destructive/10 hover:text-destructive"
        :loading="cancelling"
        @click="emit('cancel')"
      >
        Cancel import
      </SharedButton>
    </div>

    <div v-if="!active" class="mt-3 flex items-center justify-between gap-3">
      <p class="text-xs text-muted-foreground">{{ errorSummary }}</p>
      <button
        v-if="errorCount"
        type="button"
        class="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('review')"
      >
        Review errors
      </button>
    </div>

    <button
      v-if="!active"
      type="button"
      class="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      @click="expanded = !expanded"
    >
      <HugeiconsIcon :icon="expanded ? Refresh01Icon : Download01Icon" :size="14" :stroke-width="1.75" aria-hidden="true" />
      {{ expanded ? "Hide details" : "View details" }}
    </button>

    <div v-if="expanded" class="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
      <div>
        <p class="text-sm font-semibold tabular-nums">{{ contactImport.total_rows }}</p>
        <p class="text-[11px] text-muted-foreground">Total</p>
      </div>
      <div>
        <p class="text-sm font-semibold tabular-nums">{{ contactImport.imported_rows }}</p>
        <p class="text-[11px] text-muted-foreground">Uploaded</p>
      </div>
      <div>
        <p class="text-sm font-semibold tabular-nums">{{ contactImport.skipped_rows }}</p>
        <p class="text-[11px] text-muted-foreground">Skipped</p>
      </div>
    </div>
  </aside>
</template>
