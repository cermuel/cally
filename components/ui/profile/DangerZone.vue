<script setup lang="ts">
defineProps<{
  confirmText: string;
  deleting?: boolean;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const dialogOpen = ref(false);
</script>

<template>
  <section
    class="flex flex-col gap-4 rounded-xl sm:flex-row sm:items-center sm:justify-between p-4"
  >
    <div>
      <h2 class="font-semibold">Delete account</h2>
      <p class="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        Permanently remove your account and all booking data.
      </p>
    </div>
    <SharedButton
      type="button"
      variant="outline"
      class="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      @click="dialogOpen = true"
    >
      Delete account
    </SharedButton>

    <UiProfileDeleteDialog
      v-model:open="dialogOpen"
      :confirm-text="confirmText"
      :deleting="deleting"
      @confirm="emit('delete')"
    />
  </section>
</template>
