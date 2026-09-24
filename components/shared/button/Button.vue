<script setup lang="ts">
import { LoaderCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Primitive } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { computed, useAttrs } from "vue";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "./variants";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    as?: string;
    asChild?: boolean;
    class?: HTMLAttributes["class"];
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    size?:
      | "default"
      | "xs"
      | "sm"
      | "lg"
      | "icon"
      | "icon-xs"
      | "icon-sm"
      | "icon-lg";
  }>(),
  {
    as: "button",
    disabled: false,
    loading: false,
    type: "button",
  },
);

const attrs = useAttrs();
const isDisabled = computed(() => props.disabled || props.loading);
</script>

<template>
  <Primitive
    v-bind="attrs"
    data-slot="button"
    :data-loading="loading ? '' : undefined"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :aria-busy="loading ? 'true' : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :disabled="as === 'button' ? isDisabled : undefined"
    :type="as === 'button' ? type : undefined"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <HugeiconsIcon
      v-if="loading"
      :icon="LoaderCircleIcon"
      :size="16"
      color="currentColor"
      :stroke-width="1.75"
      class="animate-spin"
      aria-hidden="true"
    />
    <span v-if="loading" class="sr-only">
      <slot />
    </span>
    <slot v-else />
  </Primitive>
</template>
