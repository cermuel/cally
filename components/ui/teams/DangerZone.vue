<script setup lang="ts">
import { Delete02Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

defineProps<{
  isOwner: boolean;
}>();

const emit = defineEmits<{
  delete: [];
  leave: [];
}>();
</script>

<template>
  <section class="py-2" aria-labelledby="team-actions-title">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div class="max-w-xl">
        <h2 id="team-actions-title" class="font-semibold">Team actions</h2>
        <p class="mt-1 text-sm leading-6 text-muted-foreground">
          <template v-if="isOwner">
            Permanently delete this team and remove access for everyone.
          </template>
          <template v-else>
            Leave this team and remove it from your workspace.
          </template>
        </p>
      </div>

      <SharedButton
        v-if="isOwner"
        type="button"
        variant="destructive"
        class="shrink-0"
        @click="emit('delete')"
      >
        <HugeiconsIcon
          :icon="Delete02Icon"
          :size="16"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        Delete team
      </SharedButton>
      <SharedButton
        v-else
        type="button"
        variant="outline"
        class="shrink-0 text-destructive hover:text-destructive"
        @click="emit('leave')"
      >
        <HugeiconsIcon
          :icon="Logout01Icon"
          :size="16"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        Leave team
      </SharedButton>
    </div>
  </section>
</template>
