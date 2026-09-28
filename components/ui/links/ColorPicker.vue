<script setup lang="ts">
import { CheckIcon, PaintBrush02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { linkColors } from "~/constants/link-colors";

const props = defineProps<{
  disabled?: boolean;
}>();

const model = defineModel<string | null>({ default: null });
const open = ref(false);

const selectedColor = computed(() =>
  linkColors.find((color) => color.value === model.value),
);

const selectColor = (color: string | null) => {
  model.value = color;
  open.value = false;
};
</script>

<template>
  <SharedPopover v-model:open="open">
    <SharedPopoverTrigger as-child>
      <SharedButton
        type="button"
        variant="outline"
        :disabled="props.disabled"
        class="w-full justify-between font-normal"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span
            v-if="model"
            class="size-4 shrink-0 rounded-full ring-1 ring-black/10"
            :style="{ backgroundColor: model }"
            aria-hidden="true"
          />
          <HugeiconsIcon
            v-else
            :icon="PaintBrush02Icon"
            :size="16"
            :stroke-width="1.75"
            class="text-muted-foreground"
            aria-hidden="true"
          />
          <span>{{ selectedColor?.label || "No color" }}</span>
        </span>
        <span class="text-xs text-muted-foreground">Choose</span>
      </SharedButton>
    </SharedPopoverTrigger>
    <SharedPopoverContent align="start" class="w-50 p-3">
      <div class="grid grid-cols-4 gap-2" role="list" aria-label="Link colors">
        <button
          v-for="color in linkColors"
          :key="color.value"
          type="button"
          class="relative flex aspect-square items-center justify-center rounded-md ring-1 ring-black/10 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.96]"
          :style="{ backgroundColor: color.value }"
          :aria-label="color.label"
          :aria-pressed="model === color.value"
          @click="selectColor(color.value)"
        >
          <HugeiconsIcon
            v-if="model === color.value"
            :icon="CheckIcon"
            :size="18"
            :stroke-width="2.25"
            class="text-black/70"
            aria-hidden="true"
          />
        </button>
      </div>
    </SharedPopoverContent>
  </SharedPopover>
</template>
