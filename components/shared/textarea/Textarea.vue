<script setup lang="ts">
import {
  computed,
  type HTMLAttributes,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  useId,
  watch,
} from "vue";
import { cn } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  class?: HTMLAttributes["class"];
  error?: string;
  rows?: number;
  placeholder?: string;
}>();

const model = defineModel<string | number>();
const attrs = useAttrs();
const textarea = ref<HTMLTextAreaElement | null>(null);
const errorId = `textarea-error-${useId()}`;
const shouldShake = ref(false);

let shakeTimeout: ReturnType<typeof setTimeout> | undefined;

const ariaDescribedBy = computed(() => {
  const describedBy = attrs["aria-describedby"];
  const ids =
    typeof describedBy === "string" && describedBy.length > 0
      ? [describedBy]
      : [];

  if (props.error) {
    ids.push(errorId);
  }

  return ids.length > 0 ? ids.join(" ") : undefined;
});

watch(
  () => props.error,
  async (error) => {
    if (!error || !import.meta.client) {
      shouldShake.value = false;
      return;
    }

    shouldShake.value = false;
    await nextTick();
    shouldShake.value = true;

    if (shakeTimeout) {
      clearTimeout(shakeTimeout);
    }

    shakeTimeout = setTimeout(() => {
      shouldShake.value = false;
    }, 260);
  },
);

onBeforeUnmount(() => {
  if (shakeTimeout) {
    clearTimeout(shakeTimeout);
  }
});

defineExpose({
  focus: () => textarea.value?.focus(),
});
</script>

<template>
  <div class="space-y-1.5">
    <textarea
      :placeholder="props.placeholder"
      ref="textarea"
      v-model="model"
      v-bind="attrs"
      data-slot="textarea"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="ariaDescribedBy"
      :class="
        cn(
          'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-h-22 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-2 -outline-offset-1 outline-transparent transition-[border-color,color,outline-color] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:outline-ring/70 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive/70',
          shouldShake &&
            'motion-safe:animate-[input-error-vibrate_220ms_ease-in-out]',
          props.class,
        )
      "
      :rows="props.rows"
    />
    <p v-if="error" :id="errorId" class="text-xs text-destructive">
      {{ error }}
    </p>
  </div>
</template>
