<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { toast } from "vue-sonner";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import {
  contactsApi,
  type Contact,
  type CreateContactBookingPayload,
} from "~/utils/api/contacts";
import { queryKeys } from "~/utils/api/query-keys";

const props = defineProps<{
  contact: Contact | null;
  timezone: string;
}>();

const open = defineModel<boolean>("open", { default: false });

const client = useApiClient();
const queryClient = useQueryClient();
const linksQuery = useLinks({ enabled: open });

const eventId = ref("");
const selectedDate = ref("");
const selectedSlotId = ref("");
const notes = ref("");
const localErrors = ref<Record<string, string>>({});
const apiErrors = ref<Record<string, string[]>>({});

const availableLinks = computed(() =>
  (linksQuery.data.value?.links ?? []).filter(
    (link) => link.is_active && link.status === "published",
  ),
);
const selectedLink = computed(() =>
  availableLinks.value.find((link) => String(link.id) === eventId.value),
);
const availableTimesQuery = usePublicAvailableTimes(
  computed(() => selectedLink.value?.id ?? null),
  selectedDate,
);
const selectedSlot = computed(() =>
  (availableTimesQuery.data.value?.available_times ?? []).find(
    (slot) => slot.starts_at === selectedSlotId.value,
  ),
);
const contactName = computed(
  () =>
    props.contact?.name ||
    props.contact?.platformUser?.name ||
    props.contact?.email ||
    "this contact",
);
const fieldError = (field: string) =>
  localErrors.value[field] || apiErrors.value[field]?.[0];

const createBookingMutation = useMutation({
  mutationFn: (payload: CreateContactBookingPayload) => {
    if (!props.contact) throw new Error("No contact selected");
    return contactsApi.createBooking(client, props.contact.id, payload);
  },
  onSuccess: async () => {
    if (!props.contact) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.public.all() }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.contacts.detail(props.contact.id),
      }),
    ]);
    apiErrors.value = {};
    open.value = false;
    toast.success("Booking scheduled");
  },
  onError: (error) => {
    apiErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not schedule the booking."));
  },
});

const reset = () => {
  eventId.value =
    availableLinks.value.length === 1
      ? String(availableLinks.value[0]?.id)
      : "";
  selectedDate.value = "";
  selectedSlotId.value = "";
  notes.value = "";
  localErrors.value = {};
  apiErrors.value = {};
};

watch(open, (isOpen) => {
  if (isOpen) reset();
});

watch(availableLinks, (links) => {
  if (open.value && !eventId.value && links.length === 1) {
    eventId.value = String(links[0]?.id);
  }
});

watch(eventId, () => {
  selectedDate.value = "";
  selectedSlotId.value = "";
  localErrors.value.event_id = "";
  localErrors.value.starts_at = "";
});

const selectDate = (date: string) => {
  selectedDate.value = date;
  selectedSlotId.value = "";
  localErrors.value.starts_at = "";
};

const selectSlot = (startsAt: string) => {
  selectedSlotId.value = startsAt;
  localErrors.value.starts_at = "";
};

const submit = () => {
  localErrors.value = {};

  if (!eventId.value || !selectedLink.value) {
    localErrors.value.event_id = "Choose a meeting type.";
  }

  if (!selectedDate.value || !selectedSlot.value) {
    localErrors.value.starts_at = "Choose an available date and time.";
  }

  if (
    Object.values(localErrors.value).some(Boolean) ||
    !props.contact ||
    !selectedLink.value ||
    !selectedSlot.value
  ) {
    return;
  }

  createBookingMutation.mutate({
    event_id: String(selectedLink.value.id),
    starts_at: selectedSlot.value.starts_at,
    ends_at: selectedSlot.value.ends_at,
    timezone: availableTimesQuery.data.value?.timezone ?? props.timezone,
    notes: notes.value.trim() || null,
  });
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-60 bg-black/55 backdrop-blur-xs duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed inset-s-1/2 top-1/2 z-60 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl outline-none duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:data-[state=closed]:zoom-out-100 motion-reduce:data-[state=open]:zoom-in-100"
      >
        <header
          class="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-6"
        >
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-lg font-semibold tracking-tight">
              Schedule meeting
            </DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted-foreground">
              Create a meeting with
              <span class="font-medium text-foreground"
                >{{ contactName }}.</span
              >
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              class="-me-2 -mt-1 shrink-0 text-muted-foreground"
              aria-label="Close schedule meeting dialog"
            >
              <HugeiconsIcon
                :icon="Cancel01Icon"
                :size="18"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </SharedButton>
          </DialogClose>
        </header>

        <div class="min-h-0 overflow-y-auto p-5 sm:p-6">
          <div class="space-y-5">
            <div>
              <SharedLabel for="booking-event" class="mb-1.5 text-sm">
                Meeting type
              </SharedLabel>
              <SharedSelect
                v-model="eventId"
                :loading="linksQuery.isPending.value"
                :disabled="!availableLinks.length"
                @update:model-value="localErrors.event_id = ''"
              >
                <SharedSelectTrigger
                  id="booking-event"
                  class="w-full"
                  :aria-invalid="Boolean(fieldError('event_id'))"
                >
                  <span
                    v-if="selectedLink"
                    class="flex min-w-0 items-center gap-1.5"
                  >
                    <span class="truncate">{{ selectedLink.name }}</span>
                    <span
                      aria-hidden="true"
                      class="shrink-0 text-muted-foreground"
                    >
                      ·
                    </span>
                    <span class="shrink-0 text-muted-foreground">
                      {{ selectedLink.duration_minutes }} min
                    </span>
                  </span>
                  <SharedSelectValue
                    v-else
                    :placeholder="
                      linksQuery.isPending.value
                        ? 'Loading meeting types…'
                        : 'Select a meeting type'
                    "
                  />
                </SharedSelectTrigger>
                <SharedSelectContent class="z-70">
                  <SharedSelectItem
                    v-for="link in availableLinks"
                    :key="link.id"
                    :value="String(link.id)"
                    :text-value="link.name"
                  >
                    <span
                      class="flex w-full items-center justify-between gap-4"
                    >
                      <span>{{ link.name }}</span>
                      <span class="text-xs text-muted-foreground">
                        {{ link.duration_minutes }} min
                      </span>
                    </span>
                  </SharedSelectItem>
                </SharedSelectContent>
              </SharedSelect>
              <p
                v-if="fieldError('event_id')"
                class="mt-1.5 text-xs text-destructive"
              >
                {{ fieldError("event_id") }}
              </p>
              <p
                v-else-if="!linksQuery.isPending.value && !availableLinks.length"
                class="mt-1.5 text-xs text-muted-foreground"
              >
                Publish an active meeting type before scheduling a meeting.
              </p>
            </div>

            <UiBookingsAvailabilityPicker
              v-if="selectedLink"
              :selected-date="selectedDate"
              :selected-slot="selectedSlotId"
              :slots="availableTimesQuery.data.value?.available_times ?? []"
              :timezone="availableTimesQuery.data.value?.timezone ?? timezone"
              :loading="availableTimesQuery.isFetching.value"
              :load-error="availableTimesQuery.isError.value"
              :error="fieldError('starts_at')"
              @retry="availableTimesQuery.refetch()"
              @select-date="selectDate"
              @select-slot="selectSlot"
            />

            <div>
              <SharedLabel for="booking-notes" class="mb-1.5 text-sm">
                Notes <span class="text-muted-foreground">(optional)</span>
              </SharedLabel>
              <SharedTextarea
                id="booking-notes"
                v-model="notes"
                :rows="3"
                placeholder="Add context for this meeting"
                :error="fieldError('notes')"
              />
            </div>
          </div>
        </div>

        <footer
          class="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-6"
        >
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="outline"
              :disabled="createBookingMutation.isPending.value"
            >
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :loading="createBookingMutation.isPending.value"
            :disabled="linksQuery.isPending.value || !availableLinks.length"
            @click="submit"
          >
            Schedule meeting
          </SharedButton>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
