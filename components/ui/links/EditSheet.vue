<script setup lang="ts">
import type { Link, UpdateLinkPayload } from "~/utils/api/links";

defineProps<{
  link: Link | null;
  username?: string | null;
  saving: boolean;
  deleting: boolean;
  errors?: Record<string, string[]>;
}>();

const open = defineModel<boolean>("open", { default: false });

defineEmits<{
  delete: [link: Link];
  save: [payload: UpdateLinkPayload];
}>();
</script>

<template>
  <SharedSheet
    v-model:open="open"
    title="Edit link"
    description="Edit link details"
    close-label="Close link details"
  >
    <UiLinksDetailsForm
      v-if="link"
      :link="link"
      :username="username"
      :saving="saving"
      :deleting="deleting"
      :errors="errors"
      sheet
      @delete="$emit('delete', $event)"
      @save="$emit('save', $event)"
    />
  </SharedSheet>
</template>
