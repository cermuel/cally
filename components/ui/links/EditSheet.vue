<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import type { Link, UpdateLinkPayload } from "~/utils/api/links";
import { linksApi } from "~/utils/api/links";
import { queryKeys } from "~/utils/api/query-keys";

const props = defineProps<{
  link: Link | null;
  username?: string | null;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  delete: [link: Link];
}>();

const client = useApiClient();
const queryClient = useQueryClient();
const errors = ref<Record<string, string[]>>({});

watch([open, () => props.link?.id], ([isOpen]) => {
  if (isOpen) errors.value = {};
});

const updateMutation = useMutation({
  mutationFn: (payload: UpdateLinkPayload) => {
    if (!props.link) throw new Error("No link selected");
    return linksApi.update(client, props.link.id, payload);
  },
  onSuccess: async (response) => {
    queryClient.setQueryData(queryKeys.links.detail(response.link.id), response);
    await queryClient.invalidateQueries({ queryKey: queryKeys.links.all() });
    errors.value = {};
    open.value = false;
    toast.success("Link updated");
  },
  onError: (error) => {
    errors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not update the link."));
  },
});
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
      :saving="updateMutation.isPending.value"
      :deleting="false"
      :errors="errors"
      sheet
      @delete="$emit('delete', $event)"
      @save="updateMutation.mutate($event)"
    />
  </SharedSheet>
</template>
