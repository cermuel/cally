<script setup lang="ts">
import {
  computed,
  type HTMLAttributes,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  useId,
  useSlots,
  watch,
} from "vue";
import {
  EyeClosedIcon,
  LoaderIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { cn } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  class?: HTMLAttributes["class"];
  error?: string;
  loading?: boolean;
  type?: string;
}>();

const model = defineModel<string | number>();
const attrs = useAttrs();
const slots = useSlots();
const input = ref<HTMLInputElement | null>(null);
const errorId = `input-error-${useId()}`;
const shouldShake = ref(false);
const isPasswordVisible = ref(false);

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

const isPasswordInput = computed(() => props.type === "password");
const hasPrefix = computed(() => Boolean(slots.prefix));
const hasSuffix = computed(() => Boolean(slots.suffix || slots.right));
const hasTrailingIcon = computed(
  () => props.loading || hasSuffix.value || isPasswordInput.value,
);

const inputType = computed(() => {
  if (!isPasswordInput.value) {
    return props.type;
  }

  return isPasswordVisible.value ? "text" : "password";
});

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
  input.value?.focus();
};

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
  focus: () => input.value?.focus(),
});
</script>

<template>
  <div class="space-y-1.5">
    <div
      class="relative"
      :class="
        hasPrefix
          ? cn(
              'flex h-9 w-full min-w-0 overflow-hidden rounded-md border border-input bg-transparent shadow-xs outline-2 -outline-offset-1 outline-transparent transition-[border-color,box-shadow,outline-color] dark:bg-input/30 focus-within:border-ring focus-within:outline-ring/70',
              error &&
                'border-destructive focus-within:border-destructive focus-within:outline-destructive/70',
              shouldShake &&
                'motion-safe:animate-[input-error-vibrate_220ms_ease-in-out]',
              props.class,
            )
          : undefined
      "
    >
      <slot v-if="hasPrefix" name="prefix" />
      <input
        ref="input"
        v-model="model"
        v-bind="attrs"
        data-slot="input"
        :type="inputType"
        :aria-busy="loading ? 'true' : undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="ariaDescribedBy"
        :class="
          cn(
            hasPrefix
              ? 'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-full min-w-0 flex-1 border-0 bg-transparent px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
              : 'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-2 -outline-offset-1 outline-transparent transition-[border-color,color,outline-color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:outline-ring/70 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive/70',
            !hasPrefix && hasTrailingIcon && 'pr-10',
            !hasPrefix &&
              shouldShake &&
              'motion-safe:animate-[input-error-vibrate_220ms_ease-in-out]',
            !hasPrefix && props.class,
          )
        "
      />
      <span
        v-if="loading"
        class="flex size-9 shrink-0 items-center justify-center text-muted-foreground"
        :class="hasPrefix ? undefined : 'absolute right-0 top-0'"
      >
        <HugeiconsIcon
          :icon="LoaderIcon"
          :size="15"
          color="currentColor"
          :stroke-width="1.75"
          class="animate-spin"
          aria-hidden="true"
        />
      </span>
      <span
        v-else-if="hasSuffix"
        class="flex size-9 shrink-0 items-center justify-center text-muted-foreground"
        :class="hasPrefix ? undefined : 'absolute right-0 top-0'"
      >
        <slot name="suffix">
          <slot name="right" />
        </slot>
      </span>
      <button
        v-else-if="isPasswordInput"
        type="button"
        class="absolute right-2 top-1/2 flex size-7 cursor-pointer -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-[color,transform] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.96]"
        :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
        :aria-pressed="isPasswordVisible"
        @click="togglePasswordVisibility"
      >
        <HugeiconsIcon
          :icon="isPasswordVisible ? EyeClosedIcon : ViewIcon"
          :size="16"
          color="currentColor"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </button>
    </div>
    <p v-if="error" :id="errorId" class="text-xs text-destructive">
      {{ error }}
    </p>
  </div>
</template>
