<script setup lang="ts">
import {
  CrownIcon,
  MicrosoftAdminIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { TeamRole } from "~/utils/api/teams";

const props = defineProps<{
  role: TeamRole | "owner";
}>();

const roleIcon = computed(() => {
  if (props.role === "owner") return CrownIcon;
  if (props.role === "admin") return MicrosoftAdminIcon;
  return UserIcon;
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize"
  >
    <HugeiconsIcon
      :icon="roleIcon"
      :size="13"
      :stroke-width="1.75"
      aria-hidden="true"
    />
    {{ role }}
  </span>
</template>
