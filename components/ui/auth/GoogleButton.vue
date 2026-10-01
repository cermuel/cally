<script setup lang="ts">
import SharedButton from "~/components/shared/button/Button.vue";

withDefaults(
  defineProps<{
    label: string;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

defineEmits<{
  click: [];
}>();
</script>

<template>
  <SharedButton
    type="button"
    class="h-10 w-full"
    :loading="loading"
    @click="$emit('click')"
  >
    <img src="/svg/google.svg" alt="" class="size-4.5" />
    {{ label }}
  </SharedButton>
</template>
