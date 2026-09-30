<script setup lang="ts">
import {
  AddTeamIcon,
  Calendar03Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { nextTick, ref } from "vue";

defineProps<{
  selectedDateLabel: string;
  selectedTimeLabel: string;
  errors?: Record<string, string[]>;
}>();

const guests = defineModel<string[]>("guests", { required: true });
const showGuestErrors = ref(false);
const guestList = ref<HTMLElement | null>(null);
const guestInputs = ref<Array<{ focus: () => void } | null>>([]);
const shouldAutoScrollGuestList = ref(true);
const isAutoScrollingGuestList = ref(false);

const scrollGuestListToBottom = async () => {
  if (!shouldAutoScrollGuestList.value) {
    return;
  }

  await nextTick();

  if (!guestList.value) {
    return;
  }

  isAutoScrollingGuestList.value = true;
  guestList.value.scrollTop = guestList.value.scrollHeight;
  requestAnimationFrame(() => {
    isAutoScrollingGuestList.value = false;
  });
};

const updateGuestListAutoScroll = () => {
  if (!guestList.value || isAutoScrollingGuestList.value) {
    return;
  }

  const distanceFromBottom =
    guestList.value.scrollHeight -
    guestList.value.scrollTop -
    guestList.value.clientHeight;

  shouldAutoScrollGuestList.value = distanceFromBottom < 8;
};

const addGuest = () => {
  const emptyGuestIndex = guests.value.findIndex(
    (guest) => guest.trim().length === 0,
  );

  if (emptyGuestIndex !== -1) {
    showGuestErrors.value = true;
    void nextTick(() => guestInputs.value[emptyGuestIndex]?.focus());
    void scrollGuestListToBottom();
    return;
  }

  showGuestErrors.value = false;
  guests.value.push("");
  shouldAutoScrollGuestList.value = true;
  void scrollGuestListToBottom();
  void nextTick(() => guestInputs.value[guests.value.length - 1]?.focus());
};

const removeGuest = (index: number) => {
  guests.value.splice(index, 1);

  if (guests.value.every((guest) => guest.trim().length > 0)) {
    showGuestErrors.value = false;
  }
};
</script>

<template>
  <aside class="flex h-full min-h-0 flex-col overflow-hidden p-4 md:p-6">
    <div
      v-if="selectedDateLabel && selectedTimeLabel"
      class="mb-4 flex shrink-0 items-start gap-1.5 max-sm:my-2"
    >
      <dt class="mt-1 text-foreground">
        <HugeiconsIcon
          :icon="Calendar03Icon"
          :size="18"
          color="currentColor"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        <span class="sr-only">When</span>
      </dt>
      <dd class="leading-6 text-sm font-medium text-foreground/85">
        {{ selectedDateLabel }}<br />
        {{ selectedTimeLabel }}
      </dd>
    </div>

    <div
      class="flex min-h-0 flex-1 flex-col space-y-3 overflow-hidden pt-2 md:pt-4"
    >
      <div
        v-if="guests.length > 0"
        ref="guestList"
        class="min-h-0 flex-1 space-y-3 overflow-y-auto pe-1"
        @scroll="updateGuestListAutoScroll"
      >
        <div v-for="(_, index) in guests" :key="index" class="relative">
          <SharedInput
            ref="guestInputs"
            v-model="guests[index]"
            type="email"
            placeholder="you@example.com"
            :error="
              errors?.[`guests.${index + 1}.email`]?.[0]
              || (showGuestErrors && guests[index]?.trim().length === 0
                ? 'Enter guest email'
                : undefined)
            "
          >
            <template #suffix>
              <SharedButton
                type="button"
                variant="ghost"
                size="icon-xs"
                class="size-7 text-muted-foreground hover:bg-transparent hover:text-foreground"
                aria-label="Remove guest"
                @click="removeGuest(index)"
              >
                <HugeiconsIcon
                  :icon="Cancel01Icon"
                  :size="18"
                  color="currentColor"
                  :stroke-width="1.75"
                />
              </SharedButton>
            </template>
          </SharedInput>
        </div>
      </div>

      <SharedButton
        type="button"
        variant="secondary"
        size="sm"
        class="mt-auto shrink-0"
        @click="addGuest"
      >
        <HugeiconsIcon
          :icon="AddTeamIcon"
          :size="21"
          color="currentColor"
          :stroke-width="1.75"
        />
        Add guest
      </SharedButton>
    </div>
  </aside>
</template>
