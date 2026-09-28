<script setup lang="ts">
defineProps<{
  heading: string;
  slots: string[];
  disabled?: boolean;
}>();

defineEmits<{
  choose: [slot: string];
}>();
</script>

<template>
  <aside class="flex min-h-0 flex-col px-4 py-3 md:p-6">
    <div class="mb-3 flex shrink-0 items-center justify-between gap-4 md:mb-4">
      <h2 class="font-medium tracking-normal">
        {{ heading }}
      </h2>
    </div>

    <div class="flex min-h-0 flex-1 flex-col space-y-2 overflow-y-auto pb-4 pr-1">
      <button
        v-for="slot in slots"
        :key="slot"
        type="button"
        variant="secondary"
        :disabled="disabled"
        class="py-0.5 w-full text-center border border-border rounded-md cursor-pointer hover:border-foreground/80 duration-300 hover:text-foreground text-base font-medium text-foreground/80 transition-[border-color,background-color,transform] active:scale-[0.96]"
        :class="
          disabled &&
          'cursor-not-allowed opacity-50 hover:border-white/20 hover:bg-transparent'
        "
        @click="$emit('choose', slot)"
      >
        {{ slot }}
      </button>
    </div>
  </aside>
</template>
