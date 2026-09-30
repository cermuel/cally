<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import type { Booking } from "~/utils/api/bookings";

const props = defineProps<{
  booking: Booking | null;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  submit: [startsAt: string, endsAt: string];
}>();

const open = defineModel<boolean>("open", { default: false });
const startsAt = ref("");
const error = ref("");
const input = ref<{ focus: () => void } | null>(null);

const toLocalInputValue = (value: string | null) => {
  const date = value ? new Date(value) : new Date();
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const minimumStart = computed(() => toLocalInputValue(null));

watch(open, (isOpen) => {
  if (!isOpen) return;
  startsAt.value = toLocalInputValue(props.booking?.starts_at ?? null);
  error.value = "";
});

const submit = async () => {
  if (!props.booking || !startsAt.value) return;

  const start = new Date(startsAt.value);
  if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) {
    error.value = "Choose a future date and time.";
    await nextTick();
    input.value?.focus();
    return;
  }

  const currentDuration =
    props.booking.starts_at && props.booking.ends_at
      ? new Date(props.booking.ends_at).getTime() -
        new Date(props.booking.starts_at).getTime()
      : (props.booking.event?.duration_minutes ?? 30) * 60_000;
  const end = new Date(start.getTime() + Math.max(currentDuration, 0));

  emit("submit", start.toISOString(), end.toISOString());
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed start-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-5 shadow-xl outline-none duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:data-[state=closed]:zoom-out-100 motion-reduce:data-[state=open]:zoom-in-100"
      >
        <form @submit.prevent="submit">
          <DialogTitle class="font-semibold">Reschedule meeting</DialogTitle>
          <DialogDescription class="mt-1 text-sm leading-6 text-muted-foreground">
            Choose a new start time. The meeting duration will stay the same.
          </DialogDescription>

          <div class="mt-5 space-y-2">
            <SharedLabel for="booking-new-start">New date and time</SharedLabel>
            <SharedInput
              id="booking-new-start"
              ref="input"
              v-model="startsAt"
              type="datetime-local"
              name="booking-new-start"
              :min="minimumStart"
              :error="error"
              required
              @update:model-value="error = ''"
            />
            <p class="text-xs text-muted-foreground">
              Times are shown in your device timezone.
            </p>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <DialogClose as-child>
              <SharedButton type="button" variant="ghost" size="sm" :disabled="submitting">
                Cancel
              </SharedButton>
            </DialogClose>
            <SharedButton type="submit" size="sm" :loading="submitting">
              Save new time
            </SharedButton>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
