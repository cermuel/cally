<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Booking } from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import { guestsApi } from "~/utils/api/guests";
import { queryKeys } from "~/utils/api/query-keys";

const props = defineProps<{ booking: Booking | null }>();
const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ completed: [] }>();
const client = useApiClient();
const queryClient = useQueryClient();

const addGuestsMutation = useMutation({
  mutationFn: (emails: string[]) => {
    if (!props.booking) throw new Error("No booking selected");
    return guestsApi.add(
      client,
      props.booking.id,
      emails.map((email) => ({ email })),
    );
  },
  onSuccess: async (_response, emails) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
    open.value = false;
    emit("completed");
    toast.success(`${emails.length === 1 ? "Guest" : "Guests"} added`);
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not add the guests.")),
});
</script>

<template>
  <UiPublicAddGuestsDialog
    v-model:open="open"
    @add="addGuestsMutation.mutate($event)"
  />
</template>
