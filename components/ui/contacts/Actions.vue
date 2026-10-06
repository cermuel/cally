<script setup lang="ts">
import {
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

defineProps<{
  label: string;
}>();

const emit = defineEmits<{
  delete: [];
  edit: [];
}>();

const open = ref(false);

const selectAction = (action: "delete" | "edit") => {
  emit(action);
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
        class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        @click="selectAction('edit')"
      >
        <HugeiconsIcon
          :icon="Edit02Icon"
          :size="16"
          :stroke-width="1.5"
          aria-hidden="true"
        />
        Edit
      </button>
      <div class="my-1 h-px bg-border" role="separator" />
      <button
        type="button"
        class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm text-destructive outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-destructive"
        @click="selectAction('delete')"
      >
        <HugeiconsIcon
          :icon="Delete02Icon"
          :size="16"
          :stroke-width="1.5"
          aria-hidden="true"
        />
        Delete
      </button>
    </SharedPopoverContent>
  </SharedPopover>
</template>
