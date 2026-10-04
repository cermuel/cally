<script setup lang="ts">
defineProps<{
  id: string;
  disabled?: boolean;
  error?: string;
}>();

const duration = defineModel<string>({ required: true });
const standardDurations = [15, 30, 45, 60, 90];

const durationOptions = computed(() => {
  const currentDuration = Number(duration.value);

  if (
    Number.isInteger(currentDuration) &&
    currentDuration > 0 &&
    !standardDurations.includes(currentDuration)
  ) {
    return [...standardDurations, currentDuration].sort((a, b) => a - b);
  }

  return standardDurations;
});
</script>

<template>
  <div class="min-w-0">
    <SharedLabel :for="id" class="mb-1.5 text-sm">Duration</SharedLabel>
    <SharedSelect v-model="duration" :disabled="disabled">
      <SharedSelectTrigger
        :id="id"
        class="w-full"
        :aria-invalid="Boolean(error)"
      >
        <SharedSelectValue placeholder="Select duration" />
      </SharedSelectTrigger>
      <SharedSelectContent>
        <SharedSelectItem
          v-for="minutes in durationOptions"
          :key="minutes"
          :value="String(minutes)"
        >
          {{ minutes }} minutes
        </SharedSelectItem>
      </SharedSelectContent>
    </SharedSelect>
    <p v-if="error" class="mt-1.5 text-xs text-destructive">
      {{ error }}
    </p>
  </div>
</template>
