<script setup lang="ts">
import { PinInputInput, PinInputRoot } from "reka-ui";

const props = withDefaults(
  defineProps<{
    id?: string;
    length?: number;
    error?: string;
    disabled?: boolean;
  }>(),
  { length: 6 },
);

const emit = defineEmits<{
  complete: [code: string];
}>();

const code = defineModel<string>({ default: "" });
const errorId = `otp-error-${useId()}`;

const digits = ref<number[]>(code.value.split("").map(Number));

const updateDigits = (value: number[]) => {
  digits.value = value;
  code.value = Array.from({ length: props.length }, (_, index) =>
    Number.isInteger(value[index]) ? String(value[index]) : "",
  ).join("");
};

watch(code, (value) => {
  if (!value) digits.value = [];
});
</script>

<template>
  <div class="space-y-1.5">
    <PinInputRoot
      :id="id"
      :model-value="digits"
      type="number"
      otp
      :disabled="disabled"
      class="flex items-center gap-2"
      @update:model-value="updateDigits"
      @complete="emit('complete', $event.join(''))"
    >
      <PinInputInput
        v-for="index in props.length"
        :key="index"
        :index="index - 1"
        inputmode="numeric"
        :aria-label="`Digit ${index}`"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? errorId : undefined"
        class="size-11 min-w-0 rounded-md border border-input bg-transparent text-center text-lg font-medium tabular-nums shadow-xs outline-2 -outline-offset-1 outline-transparent transition-[border-color,outline-color] focus-visible:border-ring focus-visible:outline-ring/70 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30"
      />
    </PinInputRoot>
    <p v-if="error" :id="errorId" class="text-xs text-destructive">
      {{ error }}
    </p>
  </div>
</template>
