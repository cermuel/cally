<script setup lang="ts">
import { Add01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

defineProps<{
  variables: string[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [variable: string];
}>();

const open = ref(false);

const select = (variable: string) => {
  emit("select", variable);
  open.value = false;
};
</script>

<template>
  <SharedPopover v-model:open="open">
    <SharedPopoverTrigger as-child>
      <SharedButton
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled"
        class="h-7 gap-1 px-2 text-xs text-muted-foreground"
      >
        <HugeiconsIcon
          :icon="Add01Icon"
          :size="14"
          :stroke-width="2"
          aria-hidden="true"
        />
        Add variable
        <HugeiconsIcon
          :icon="ArrowDown01Icon"
          :size="13"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </SharedButton>
    </SharedPopoverTrigger>
    <SharedPopoverContent align="end" class="w-64 p-1.5">
      <p class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Insert a personalisation variable
      </p>
      <button
        v-for="variable in variables"
        :key="variable"
        type="button"
        class="flex w-full rounded-md px-2 py-2 font-mono text-xs transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        @click="select(variable)"
      >
        {{ variable }}
      </button>
    </SharedPopoverContent>
  </SharedPopover>
</template>
