<script setup lang="ts">
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { TeamRole } from "~/utils/api/teams";

const props = defineProps<{
  disabled: boolean;
  label: string;
  loading: boolean;
  role: TeamRole;
}>();

const emit = defineEmits<{
  updateRole: [role: TeamRole];
}>();

const open = ref(false);
const nextRole = computed<TeamRole>(() =>
  props.role === "admin" ? "member" : "admin",
);
const actionLabel = computed(() =>
  nextRole.value === "admin" ? "Make admin" : "Make member",
);

const updateRole = () => {
  emit("updateRole", nextRole.value);
  open.value = false;
};
</script>

<template>
  <SharedPopover v-model:open="open">
    <SharedPopoverTrigger as-child>
      <SharedButton
        type="button"
        variant="ghost"
        size="icon-sm"
        class="text-muted-foreground"
        :disabled="disabled"
        :loading="loading"
        :aria-label="`Actions for ${label}`"
      >
        <HugeiconsIcon
          :icon="MoreHorizontalIcon"
          :size="18"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </SharedButton>
    </SharedPopoverTrigger>
    <SharedPopoverContent align="end" class="w-40 p-1.5">
      <button
        type="button"
        class="flex h-8 w-full items-center rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        @click="updateRole"
      >
        {{ actionLabel }}
      </button>
    </SharedPopoverContent>
  </SharedPopover>
</template>
