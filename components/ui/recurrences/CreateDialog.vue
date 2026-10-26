<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
  ChevronDownIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { isAxiosError } from "axios";
import type { DateRange, DateValue } from "reka-ui";
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
import type { Contact } from "~/utils/api/contacts";
import { contactsApi } from "~/utils/api/contacts";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import { linksApi, type Link } from "~/utils/api/links";
import {
  recurrencesApi,
  type CreateRecurrencePayload,
  type Recurrence,
  type RecurrenceFrequency,
} from "~/utils/api/recurrences";
import { queryKeys } from "~/utils/api/query-keys";
import { normalizeLinkSlug } from "~/utils/links";

const props = defineProps<{
  contact?: Contact | null;
  teamId?: number;
  timezone: string;
}>();
const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ created: [recurrence: Recurrence] }>();
const client = useApiClient();
const queryClient = useQueryClient();

const step = ref<1 | 2>(1);
const name = ref("");
const duration = ref("30");
const createdEvent = shallowRef<Link | null>(null);
const contactId = ref("");
const contactOptions = shallowRef<Contact[]>([]);
const selectedContact = shallowRef<Contact | null>(props.contact ?? null);
type RecurrenceCadence = "daily" | "weekly" | "biweekly" | "monthly";
const cadence = ref<RecurrenceCadence>("weekly");
const frequency = ref<RecurrenceFrequency>("weekly");
const interval = ref(1);
const daysOfWeek = ref<number[]>([]);
const weekdaysTouched = ref(false);
const startTime = ref("09:00");
const dateRange = shallowRef<DateRange>({ start: undefined, end: undefined });
const weekdaysOpen = ref(false);
const startDateOpen = ref(false);
const endDateOpen = ref(false);
const createContactOpen = ref(false);
const contactPrefillEmail = ref("");
const contactPrefillName = ref("");
const scheduleSentence = ref<HTMLElement | null>(null);
const localErrors = ref<Record<string, string>>({});
const apiErrors = ref<Record<string, string[]>>({});
const conflictOpen = ref(false);
const conflictPayload = shallowRef<CreateRecurrencePayload | null>(null);
const isTeamRecurrence = computed(() => props.teamId !== undefined);
const conflictMessage = "One or more meeting times are already reserved.";

const cadenceOptions: { value: RecurrenceCadence; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];
const weekdayOptions = [
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
  { value: 0, short: "Sun", label: "Sunday" },
] as const;
const timeOptions = Array.from({ length: 24 * 12 }, (_, index) => {
  const hour = Math.floor(index / 12);
  const minute = (index % 12) * 5;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const contactItems = computed(() =>
  selectedContact.value &&
  !contactOptions.value.some(
    (contact) => contact.id === selectedContact.value?.id,
  )
    ? [selectedContact.value, ...contactOptions.value]
    : contactOptions.value,
);
const startsOn = computed(() => dateRange.value.start?.toString() ?? "");
const endsOn = computed(() => dateRange.value.end?.toString() ?? "");
const minimumStartDate = computed(() => todayInTimezone().add({ days: 1 }));
const minimumEndDate = computed(
  () => dateRange.value.start ?? minimumStartDate.value,
);
const weekdaySummary = computed(() => {
  const selected = weekdayOptions.filter((day) =>
    daysOfWeek.value.includes(day.value),
  );
  if (selected.length === 0) return "Choose days";
  if (selected.length === 1) return selected[0]?.label ?? "Choose days";
  return selected.map((day) => day.short).join(", ");
});
const fieldError = (field: string) =>
  localErrors.value[field] || apiErrors.value[field]?.[0];

function todayInTimezone() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: props.timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((value) => value.type === type)?.value);
  return new CalendarDate(part("year"), part("month"), part("day"));
}
function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
function formatTime(value: string) {
  if (!value) return "";
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
}
const setDefaultRange = () => {
  const start = todayInTimezone().add({ days: 1 });
  dateRange.value = { start, end: start.add({ weeks: 12 }) };
  daysOfWeek.value = [new Date(`${start.toString()}T00:00:00Z`).getUTCDay()];
};
const reset = () => {
  step.value = 1;
  name.value = "";
  duration.value = "30";
  createdEvent.value = null;
  selectedContact.value = props.contact ?? null;
  contactId.value = props.contact ? String(props.contact.id) : "";
  contactOptions.value = props.contact ? [props.contact] : [];
  cadence.value = "weekly";
  frequency.value = "weekly";
  interval.value = 1;
  weekdaysTouched.value = false;
  startTime.value = "09:00";
  setDefaultRange();
  localErrors.value = {};
  apiErrors.value = {};
  conflictOpen.value = false;
  conflictPayload.value = null;
};
watch(open, (isOpen) => {
  if (isOpen) reset();
});
watch(contactId, (id) => {
  selectedContact.value =
    contactItems.value.find((contact) => String(contact.id) === id) ?? null;
  localErrors.value.contact_id = "";
});
watch(
  () => dateRange.value.start?.toString(),
  (next, previous) => {
    localErrors.value.starts_on = "";
    if (!next || next === previous || weekdaysTouched.value) return;
    daysOfWeek.value = [new Date(`${next}T00:00:00`).getDay()];
  },
);
watch(
  () => dateRange.value.end?.toString(),
  () => {
    localErrors.value.ends_on = "";
  },
);

const searchContacts = async (query: string) => {
  const response = await contactsApi.list(client, {
    ...(query.trim() ? { search: query.trim() } : {}),
    sort_by: "name",
    direction: "asc",
    page: 1,
    per_page: 20,
  });
  contactOptions.value = response.contacts;
  return response.contacts;
};
const contactLabel = (contact: Contact) =>
  contact.name || contact.platformUser?.name || contact.email;
const contactSearchText = (contact: Contact) =>
  `${contactLabel(contact)} ${contact.email}`;
const handleContactCreated = (contact: Contact) => {
  selectedContact.value = contact;
  contactId.value = String(contact.id);
  contactOptions.value = [
    contact,
    ...contactOptions.value.filter((option) => option.id !== contact.id),
  ];
  contactPrefillEmail.value = "";
  contactPrefillName.value = "";
  createContactOpen.value = false;
};
const openCreateContact = (query = "") => {
  const value = query.trim();
  const isEmail = helpers.validateEmail(value);
  contactPrefillEmail.value = isEmail ? value.toLowerCase() : "";
  contactPrefillName.value = isEmail ? "" : value;
  createContactOpen.value = true;
};
const toggleWeekday = async (day: number) => {
  const container = scheduleSentence.value;
  const elements = container
    ? Array.from(container.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      )
    : [];

  for (const element of elements) {
    for (const animation of element.getAnimations()) animation.cancel();
  }
  const positions = new Map(
    elements.map((element) => [element, element.getBoundingClientRect()]),
  );

  weekdaysTouched.value = true;
  daysOfWeek.value = daysOfWeek.value.includes(day)
    ? daysOfWeek.value.filter((value) => value !== day)
    : [...daysOfWeek.value, day];
  localErrors.value.days_of_week = "";

  await nextTick();
  if (
    !container ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  for (const element of elements) {
    const previous = positions.get(element);
    if (!previous || !element.isConnected) continue;
    const current = element.getBoundingClientRect();
    const x = previous.left - current.left;
    const y = previous.top - current.top;
    if (Math.abs(x) < 1 && Math.abs(y) < 1) continue;

    element.animate(
      [
        { transform: `translate(${x}px, ${y}px)` },
        { transform: "translate(0, 0)" },
      ],
      {
        duration: 200,
        easing: "cubic-bezier(0.77, 0, 0.175, 1)",
      },
    );
  }
};

watch(cadence, (value) => {
  frequency.value = value === "biweekly" ? "weekly" : value;
  interval.value = value === "biweekly" ? 2 : 1;
});

const selectStartDate = (value: DateValue | DateValue[] | undefined) => {
  const date = Array.isArray(value) ? value[0] : value;
  if (!date) return;
  dateRange.value = {
    start: date,
    end:
      dateRange.value.end && dateRange.value.end.compare(date) >= 0
        ? dateRange.value.end
        : date,
  };
  startDateOpen.value = false;
};

const selectEndDate = (value: DateValue | DateValue[] | undefined) => {
  const date = Array.isArray(value) ? value[0] : value;
  if (!date) return;
  dateRange.value = { ...dateRange.value, end: date };
  endDateOpen.value = false;
};

const validateDetails = () => {
  localErrors.value = {};
  apiErrors.value = {};
  if (name.value.trim().length < 4 || name.value.trim().length > 30)
    localErrors.value.name = "Use between 4 and 30 characters.";
  if (!Number.isInteger(Number(duration.value)) || Number(duration.value) <= 0)
    localErrors.value.duration_minutes = "Choose a valid duration.";
  return !Object.values(localErrors.value).some(Boolean);
};
const continueToSchedule = async () => {
  if (!validateDetails()) return;

  if (
    createdEvent.value &&
    createdEvent.value.name === name.value.trim() &&
    createdEvent.value.duration_minutes === Number(duration.value)
  ) {
    step.value = 2;
    return;
  }

  try {
    await createEventMutation.mutateAsync();
    step.value = 2;
  } catch {
    // The mutation keeps this step open and shows the actionable API error.
  }
};
const validateSchedule = () => {
  localErrors.value = {};
  apiErrors.value = {};
  const today = todayInTimezone().toString();
  if (!isTeamRecurrence.value && !selectedContact.value)
    localErrors.value.contact_id = "Choose a contact.";
  if (frequency.value === "weekly" && !daysOfWeek.value.length)
    localErrors.value.days_of_week = "Choose at least one weekday.";
  if (!startsOn.value) localErrors.value.starts_on = "Choose a start date.";
  if (!endsOn.value) localErrors.value.ends_on = "Choose an end date.";
  if (startsOn.value && startsOn.value <= today)
    localErrors.value.starts_on = "Choose a future start date.";
  if (startsOn.value && endsOn.value && endsOn.value < startsOn.value)
    localErrors.value.ends_on =
      "Choose an end date on or after the start date.";
  if (!startTime.value) localErrors.value.start_time = "Choose a start time.";
  return !Object.values(localErrors.value).some(Boolean);
};

const createEventMutation = useMutation({
  mutationFn: () => {
    if (createdEvent.value) {
      return linksApi.update(client, createdEvent.value.id, {
        name: name.value.trim(),
        duration_minutes: Number(duration.value),
      });
    }

    const nameSlug =
      normalizeLinkSlug(normalizeLinkSlug(name.value).slice(0, 8)) || "meeting";

    return linksApi.create(client, {
      name: name.value.trim(),
      slug: `recurring-${nameSlug}-${Date.now()}`,
      duration_minutes: Number(duration.value),
      status: "published",
      is_profile: false,
      private: true,
    });
  },
  onSuccess: (response) => {
    createdEvent.value = response.link;
  },
  onError: (error) => {
    apiErrors.value = getApiFieldErrors(error);
    step.value = 1;
    toast.error(
      getApiErrorMessage(error, "Could not save the meeting details."),
    );
  },
});
const createMutation = useMutation({
  mutationFn: (payload: CreateRecurrencePayload) =>
    recurrencesApi.create(client, payload),
  onSuccess: async (response) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.recurrences.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() }),
      ...(props.teamId
        ? [
            queryClient.invalidateQueries({
              queryKey: queryKeys.teams.bookings(props.teamId),
            }),
          ]
        : []),
    ]);
    open.value = false;
    toast.success("Recurring meeting created");
    emit("created", response.body);
  },
  onError: (error, payload) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 409 &&
      error.response.data?.message === conflictMessage
    ) {
      conflictPayload.value = payload;
      conflictOpen.value = true;
      return;
    }

    apiErrors.value = getApiFieldErrors(error);
    toast.error(
      getApiErrorMessage(error, "Could not create the recurring meeting."),
    );
  },
});
const handleConflictCreated = (recurrence: Recurrence) => {
  conflictPayload.value = null;
  open.value = false;
  toast.success("Recurring meeting created");
  emit("created", recurrence);
};
const isPending = computed(
  () => createEventMutation.isPending.value || createMutation.isPending.value,
);
const submit = async () => {
  if (!validateSchedule()) return;
  if (!isTeamRecurrence.value && !selectedContact.value) return;
  let event = createdEvent.value;
  if (!event) {
    try {
      event = (await createEventMutation.mutateAsync()).link;
    } catch {
      return;
    }
  }
  const schedule = {
    event_id: event.id,
    frequency: frequency.value,
    interval: interval.value,
    ...(frequency.value === "weekly"
      ? { days_of_week: [...daysOfWeek.value].sort((a, b) => a - b) }
      : {}),
    starts_on: startsOn.value,
    ends_on: endsOn.value,
    start_time: startTime.value,
  };

  createMutation.mutate(
    props.teamId
      ? { ...schedule, team_id: props.teamId }
      : { ...schedule, contact_id: selectedContact.value!.id },
  );
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-60 bg-black/60 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed inset-s-1/2 top-1/2 z-60 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <header
          class="flex shrink-0 items-start gap-4 border-b border-border px-6 py-5"
        >
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-lg font-semibold"
              >Create recurring meeting</DialogTitle
            >
            <DialogDescription class="mt-1 text-sm text-muted-foreground">
              {{
                step === 1
                  ? "Step 1 of 2 · Meeting details"
                  : isTeamRecurrence
                    ? "Step 2 of 2 · Schedule"
                    : "Step 2 of 2 · Contact and schedule"
              }}
            </DialogDescription>
          </div>
          <DialogClose as-child
            ><SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              class="-me-2 -mt-1"
              aria-label="Close recurring meeting dialog"
              ><HugeiconsIcon
                :icon="Cancel01Icon"
                :size="18"
                :stroke-width="1.75"
                aria-hidden="true" /></SharedButton
          ></DialogClose>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto p-6">
          <Transition mode="out-in">
            <section
              v-if="step === 1"
              key="details"
              aria-label="Meeting details"
            >
              <div class="space-y-5">
                <div>
                  <SharedLabel for="recurrence-name" class="mb-1.5 text-sm"
                    >Meeting name</SharedLabel
                  >
                  <SharedInput
                    id="recurrence-name"
                    v-model="name"
                    autocomplete="off"
                    maxlength="30"
                    placeholder="Weekly design review"
                    :error="fieldError('name')"
                    @update:model-value="localErrors.name = ''"
                    @keydown.enter="continueToSchedule"
                  />
                </div>
                <UiLinksDurationSelect
                  v-model="duration"
                  id="recurrence-duration"
                  content-class="z-70"
                  :error="fieldError('duration_minutes')"
                />
              </div>
            </section>

            <section
              v-else
              key="schedule"
              :aria-label="
                isTeamRecurrence ? 'Schedule' : 'Contact and schedule'
              "
            >
              <div
                ref="scheduleSentence"
                class="flex flex-wrap items-center gap-x-2 gap-y-3 text-base leading-9"
              >
                <span>Schedule a</span>

                <SharedSelect v-model="cadence">
                  <SharedSelectTrigger
                    class="w-24"
                    aria-label="Repeat frequency"
                  >
                    <SharedSelectValue />
                  </SharedSelectTrigger>
                  <SharedSelectContent class="z-70">
                    <SharedSelectItem
                      v-for="option in cadenceOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </SharedSelectItem>
                  </SharedSelectContent>
                </SharedSelect>

                <template v-if="!isTeamRecurrence">
                  <span>meeting with</span>
                  <SharedSearchSelect
                    id="recurrence-contact"
                    v-model="contactId"
                    class="w-40"
                    :items="contactItems"
                    :search="searchContacts"
                    :get-item-value="(contact) => String(contact.id)"
                    :get-item-label="contactLabel"
                    :get-item-text="contactSearchText"
                    placeholder="Select contact"
                    search-placeholder="Search contacts..."
                    content-class="z-70"
                    :aria-invalid="Boolean(fieldError('contact_id'))"
                    @search-error="
                      toast.error(
                        'Could not search contacts. Please try again.',
                      )
                    "
                  >
                    <template #value="{ item }">
                      <UiPublicProfileAvatar
                        :image="item.platformUser?.avatar ?? undefined"
                        :name="contactLabel(item)"
                        class="size-5!"
                      />

                      <span class="hidden shrink-0 text-foreground sm:inline">
                        {{ contactLabel(item) }}
                      </span>
                    </template>
                    <template #item="{ item }">
                      <UiPublicProfileAvatar
                        :image="item.platformUser?.avatar ?? undefined"
                        :name="contactLabel(item)"
                        class="size-7!"
                      />
                      <div class="min-w-0 flex-1">
                        <p class="truncate">{{ contactLabel(item) }}</p>
                        <p
                          v-if="contactLabel(item) !== item.email"
                          class="truncate text-xs text-muted-foreground"
                        >
                          {{ item.email }}
                        </p>
                      </div>
                    </template>
                    <template #empty="{ query }">
                      <div class="px-1 py-1 text-center">
                        <p class="font-medium text-foreground">
                          No contacts found
                        </p>

                        <SharedButton
                          type="button"
                          size="sm"
                          class="mt-1 w-max"
                          @click.stop="openCreateContact(query)"
                        >
                          Create contact
                        </SharedButton>
                      </div>
                    </template>
                  </SharedSearchSelect>
                </template>

                <template v-if="frequency === 'weekly'">
                  <span>on</span>
                  <SharedPopover v-model:open="weekdaysOpen">
                    <SharedPopoverTrigger as-child>
                      <SharedButton
                        type="button"
                        variant="outline"
                        class="max-w-64 justify-between font-normal"
                        :aria-invalid="Boolean(fieldError('days_of_week'))"
                      >
                        <span class="truncate">
                          {{ weekdaySummary }}
                        </span>
                        <HugeiconsIcon
                          :icon="ChevronDownIcon"
                          :size="16"
                          :stroke-width="1.75"
                          class="text-muted-foreground"
                          aria-hidden="true"
                        />
                      </SharedButton>
                    </SharedPopoverTrigger>
                    <SharedPopoverContent align="start" class="z-70 w-48 p-1">
                      <label
                        v-for="day in weekdayOptions"
                        :key="day.value"
                        class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent"
                      >
                        <SharedCheckbox
                          :model-value="daysOfWeek.includes(day.value)"
                          @update:model-value="toggleWeekday(day.value)"
                        />
                        {{ day.label }}
                      </label>
                    </SharedPopoverContent>
                  </SharedPopover>
                </template>

                <span>at</span>
                <SharedSearchSelect
                  v-model="startTime"
                  class="w-28"
                  content-class="z-70"
                  :items="timeOptions"
                  :get-item-value="(time) => time"
                  :get-item-label="formatTime"
                  :get-item-text="formatTime"
                  placeholder="Select time"
                  search-placeholder="Search times..."
                  :aria-invalid="Boolean(fieldError('start_time'))"
                  aria-label="Start time"
                  @update:model-value="localErrors.start_time = ''"
                >
                  <template #value="{ item }">
                    <span>{{ formatTime(item) }}</span>
                  </template>
                </SharedSearchSelect>
                <span>starting</span>
                <SharedPopover v-model:open="startDateOpen">
                  <SharedPopoverTrigger as-child>
                    <SharedButton
                      type="button"
                      variant="outline"
                      class="font-normal"
                      :aria-invalid="Boolean(fieldError('starts_on'))"
                    >
                      <HugeiconsIcon
                        :icon="Calendar03Icon"
                        :size="16"
                        :stroke-width="1.75"
                        class="text-muted-foreground"
                        aria-hidden="true"
                      />
                      {{ startsOn ? formatDate(startsOn) : "Start date" }}
                    </SharedButton>
                  </SharedPopoverTrigger>
                  <SharedPopoverContent align="start" class="z-70 w-max p-3">
                    <SharedCalendar
                      :model-value="dateRange.start"
                      :min-value="minimumStartDate"
                      calendar-label="Series start date"
                      prevent-deselect
                      size="sm"
                      class="p-0"
                      @update:model-value="selectStartDate"
                    />
                  </SharedPopoverContent>
                </SharedPopover>

                <span>and ending</span>
                <SharedPopover v-model:open="endDateOpen">
                  <SharedPopoverTrigger as-child>
                    <SharedButton
                      type="button"
                      variant="outline"
                      class="font-normal"
                      :aria-invalid="Boolean(fieldError('ends_on'))"
                    >
                      <HugeiconsIcon
                        :icon="Calendar03Icon"
                        :size="16"
                        :stroke-width="1.75"
                        class="text-muted-foreground"
                        aria-hidden="true"
                      />
                      {{ endsOn ? formatDate(endsOn) : "End date" }}
                    </SharedButton>
                  </SharedPopoverTrigger>
                  <SharedPopoverContent align="end" class="z-70 w-max p-3">
                    <SharedCalendar
                      :model-value="dateRange.end"
                      :min-value="minimumEndDate"
                      calendar-label="Series end date"
                      prevent-deselect
                      size="sm"
                      class="p-0"
                      @update:model-value="selectEndDate"
                    />
                  </SharedPopoverContent>
                </SharedPopover>
              </div>
            </section>
          </Transition>
        </div>

        <footer
          class="flex shrink-0 justify-end gap-2 border-t border-border px-6 py-4"
        >
          <template v-if="step === 1">
            <DialogClose as-child
              ><SharedButton type="button" variant="outline"
                >Cancel</SharedButton
              ></DialogClose
            >
            <SharedButton
              type="button"
              :loading="createEventMutation.isPending.value"
              @click="continueToSchedule"
              >Continue
              <HugeiconsIcon
                :icon="ArrowRight01Icon"
                :size="16"
                :stroke-width="1.75"
                aria-hidden="true"
            /></SharedButton>
          </template>
          <template v-else>
            <SharedButton
              type="button"
              variant="outline"
              :disabled="isPending"
              @click="step = 1"
              ><HugeiconsIcon
                :icon="ArrowLeft01Icon"
                :size="16"
                :stroke-width="1.75"
                aria-hidden="true"
              />Back</SharedButton
            >
            <SharedButton type="button" :loading="isPending" @click="submit"
              >Create recurring meeting</SharedButton
            >
          </template>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
  <UiContactsFormDialog
    v-if="!isTeamRecurrence"
    v-model:open="createContactOpen"
    :initial-email="contactPrefillEmail"
    :initial-name="contactPrefillName"
    nested
    @saved="handleContactCreated"
  />
  <UiRecurrencesConflictDialog
    v-model:open="conflictOpen"
    :payload="conflictPayload"
    @created="handleConflictCreated"
  />
</template>
