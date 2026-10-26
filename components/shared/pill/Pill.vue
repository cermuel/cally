<script setup lang="ts">
import type { PropType } from "vue";
import type { PillValue } from "../../../types/components/shared/pill.d";
import { cn } from "../../../lib/utils";

defineProps({
  value: {
    type: String as PropType<PillValue>,
    required: true,
  },
});

const labels: Record<PillValue, string> = {
  accepted: "Accepted",
  active: "Active",
  cancelled: "Cancelled",
  completed: "Completed",
  "coming-soon": "Coming soon",
  confirmed: "Confirmed",
  connected: "Connected",
  declined: "Declined",
  draft: "Draft",
  expired: "Expired",
  failed: "Failed",
  inactive: "Inactive",
  pending: "Pending",
  processing: "Processing",
  published: "Published",
  rejected: "Rejected",
};

const positive =
  "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300";
const negative = "bg-destructive/10 text-destructive ring-destructive/20";
const warning =
  "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300";
const info =
  "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300";
const neutral = "bg-muted text-muted-foreground ring-border";

const toneClasses: Record<PillValue, string> = {
  accepted: positive,
  active: positive,
  cancelled: negative,
  completed: info,
  "coming-soon": neutral,
  confirmed: positive,
  connected: positive,
  declined: negative,
  draft: neutral,
  expired: neutral,
  failed: negative,
  inactive: neutral,
  pending: warning,
  processing: warning,
  published: positive,
  rejected: negative,
};
</script>

<template>
  <span
    data-slot="pill"
    :class="
      cn(
        'inline-flex w-fit shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        toneClasses[value],
      )
    "
  >
    {{ labels[value] }}
  </span>
</template>
