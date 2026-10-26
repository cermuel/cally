<script setup lang="ts">
import {
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { BookingScope } from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import type {
  TeamBooking,
  TeamBookingListParams,
} from "~/utils/api/team-bookings";
import type { Recurrence } from "~/utils/api/recurrences";

const props = defineProps<{
  teamId: number;
  canManage: boolean;
  timezone: string;
}>();

const route = useRoute();
const router = useRouter();
const section = ref<"meetings" | "recurring">("meetings");
const page = ref(1);
const perPage = ref(10);
const scope = ref<BookingScope>("all");
const createOpen = ref(false);
const createRecurrenceOpen = ref(false);
const editOpen = ref(false);
const actionOpen = ref(false);
const action = ref<"cancel" | "delete">("cancel");
const selectedBooking = ref<TeamBooking | null>(null);
const recurrencePage = ref(1);
const recurrenceParams = computed(() => ({
  team_id: props.teamId,
  page: recurrencePage.value,
}));
const recurrencesQuery = useRecurrences(recurrenceParams);

const linkedBookingId = computed(() => {
  const value = route.query.booking_id;
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
});
const detailsOpen = computed({
  get: () => linkedBookingId.value !== null,
  set: (open) => {
    if (open || linkedBookingId.value === null) return;
    void router.replace({ query: { ...route.query, booking_id: undefined } });
  },
});
const linkedRecurrenceId = computed(() => {
  const value = route.query.recurrence_id;
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
});
const recurrenceDetailsOpen = computed(() => linkedRecurrenceId.value !== null);
const params = computed<TeamBookingListParams>(() => ({
  page: page.value,
  per_page: perPage.value,
  ...(scope.value === "pending" ? { status: "pending" as const } : {}),
  ...(scope.value === "cancelled" ? { status: "cancelled" as const } : {}),
}));
const bookingsQuery = useTeamBookings(() => props.teamId, params);
const bookings = computed(() => {
  const items = bookingsQuery.data.value?.bookings ?? [];
  const now = Date.now();

  if (scope.value === "upcoming") {
    return items.filter(
      (booking) =>
        booking.status !== "cancelled" &&
        booking.status !== "completed" &&
        !!booking.starts_at &&
        new Date(booking.starts_at).getTime() >= now,
    );
  }

  if (scope.value === "past") {
    return items.filter(
      (booking) =>
        booking.status === "completed" ||
        (!!booking.starts_at && new Date(booking.starts_at).getTime() < now),
    );
  }

  return items;
});
const pagination = computed(() => bookingsQuery.data.value?.pagination);
const showPagination = computed(
  () =>
    !!pagination.value &&
    (pagination.value.total > 10 || perPage.value < pagination.value.total),
);

watch(scope, () => {
  page.value = 1;
});

watch(
  linkedRecurrenceId,
  (id) => {
    if (id !== null) section.value = "recurring";
  },
  { immediate: true },
);

const openDetails = (booking: TeamBooking) => {
  void router.push({
    query: { ...route.query, booking_id: String(booking.id) },
  });
};
const openEdit = (booking: TeamBooking) => {
  selectedBooking.value = booking;
  editOpen.value = true;
};
const openAction = (booking: TeamBooking, nextAction: "cancel" | "delete") => {
  selectedBooking.value = booking;
  action.value = nextAction;
  actionOpen.value = true;
};
const handleCreated = (bookingId: number) => {
  void router.push({
    query: { ...route.query, booking_id: String(bookingId) },
  });
};
const openRecurrence = (recurrence: Recurrence) => {
  void router.push({
    query: {
      ...route.query,
      booking_id: undefined,
      recurrence_id: String(recurrence.id),
    },
  });
};
const handleRecurrenceCreated = (recurrence: Recurrence) => {
  section.value = "recurring";
  openRecurrence(recurrence);
};
const setRecurrenceDetailsOpen = (open: boolean) => {
  if (open || linkedRecurrenceId.value === null) return;
  void router.replace({
    query: { ...route.query, recurrence_id: undefined },
  });
};
const handleRecurrenceDeleted = () => {
  void router.replace({
    query: { ...route.query, recurrence_id: undefined },
  });
};
const handleActionCompleted = () => {
  selectedBooking.value = null;
  if (linkedBookingId.value !== null) {
    void router.replace({ query: { ...route.query, booking_id: undefined } });
  }
};
</script>

<template>
  <section aria-labelledby="team-meetings-heading">
    <div class="flex items-start justify-between gap-4">
      <SharedTabs v-model="section">
        <SharedTabsList aria-label="Team meeting collections">
          <SharedTabsTrigger value="meetings">Meetings</SharedTabsTrigger>
          <SharedTabsTrigger value="recurring">Recurring</SharedTabsTrigger>
        </SharedTabsList>
      </SharedTabs>
      <UiBookingsCreateMenu
        v-if="canManage"
        context="team"
        button-class="shrink-0"
        @once="createOpen = true"
        @recurring="createRecurrenceOpen = true"
      />
    </div>

    <UiBookingsTabs
      v-if="section === 'meetings'"
      v-model="scope"
      class="mt-5 w-full"
    />

    <div
      v-if="section === 'meetings' && bookingsQuery.isError.value"
      role="alert"
      class="mt-5 flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <p class="text-sm text-destructive">
        {{
          getApiErrorMessage(
            bookingsQuery.error.value,
            "Could not load team meetings.",
          )
        }}
      </p>
      <SharedButton
        type="button"
        variant="outline"
        size="sm"
        @click="bookingsQuery.refetch()"
        >Try again</SharedButton
      >
    </div>

    <div
      v-else-if="section === 'meetings' && bookingsQuery.isPending.value"
      class="mt-5 space-y-3"
      aria-label="Loading team meetings"
    >
      <div
        v-for="index in 3"
        :key="index"
        class="h-40 animate-pulse rounded-xl border border-border bg-muted/50"
      />
    </div>

    <div v-else-if="section === 'meetings' && bookings.length" class="mt-5">
      <div class="space-y-3">
        <UiTeamsMeetingCard
          v-for="booking in bookings"
          :key="booking.id"
          :booking="booking"
          :can-manage="canManage"
          @open="openDetails"
          @edit="openEdit"
          @cancel="openAction($event, 'cancel')"
          @delete="openAction($event, 'delete')"
        />
      </div>

      <div
        v-if="showPagination && pagination"
        class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        aria-label="Team meeting pages"
      >
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <SharedSelect
            :model-value="String(perPage)"
            @update:model-value="
              perPage = Number($event);
              page = 1;
            "
          >
            <SharedSelectTrigger size="sm" aria-label="Rows per page">
              <SharedSelectValue />
            </SharedSelectTrigger>
            <SharedSelectContent>
              <SharedSelectItem
                v-for="size in [5, 10, 20, 50]"
                :key="size"
                :value="String(size)"
              >
                {{ size }}
              </SharedSelectItem>
            </SharedSelectContent>
          </SharedSelect>
        </div>

        <div
          v-if="pagination.last_page > 1"
          class="flex items-center justify-between gap-4 sm:justify-end"
        >
          <SharedButton
            type="button"
            variant="outline"
            size="sm"
            :disabled="pagination.current_page === 1"
            @click="page = pagination.current_page - 1"
          >
            Previous
          </SharedButton>
          <p class="text-sm text-muted-foreground">
            Page {{ pagination.current_page }} of {{ pagination.last_page }}
          </p>
          <SharedButton
            type="button"
            variant="outline"
            size="sm"
            :disabled="pagination.current_page === pagination.last_page"
            @click="page = pagination.current_page + 1"
          >
            Next
          </SharedButton>
        </div>
      </div>
    </div>

    <div
      v-else-if="section === 'meetings'"
      class="mt-5 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center"
    >
      <div
        class="mx-auto grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"
      >
        <HugeiconsIcon
          :icon="Calendar03Icon"
          :size="21"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </div>
      <p class="mt-4 font-semibold">No team meetings found</p>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {{
          scope !== "all"
            ? "Try clearing the active filters."
            : canManage
              ? "Create a meeting to bring the team together."
              : "An owner or admin can create the first meeting."
        }}
      </p>
      <UiBookingsCreateMenu
        v-if="canManage && scope === 'all'"
        context="team"
        button-class="mt-5"
        @once="createOpen = true"
        @recurring="createRecurrenceOpen = true"
      />
    </div>

    <div
      v-if="section === 'recurring' && recurrencesQuery.isError.value"
      role="alert"
      class="mt-5 flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <p class="text-sm text-destructive">
        {{
          getApiErrorMessage(
            recurrencesQuery.error.value,
            "Could not load recurring team meetings.",
          )
        }}
      </p>
      <SharedButton
        type="button"
        variant="outline"
        size="sm"
        @click="recurrencesQuery.refetch()"
      >
        Try again
      </SharedButton>
    </div>

    <UiRecurrencesList
      v-if="section === 'recurring'"
      class="mt-5"
      :recurrences="recurrencesQuery.data.value?.recurrences"
      :pagination="recurrencesQuery.data.value?.pagination"
      :loading="recurrencesQuery.isPending.value"
      @open="openRecurrence"
      @page="recurrencePage = $event"
    />

    <UiTeamsMeetingDialog
      v-model:open="createOpen"
      :team-id="teamId"
      :timezone="timezone"
      @completed="handleCreated"
    />
    <UiRecurrencesCreateDialog
      v-model:open="createRecurrenceOpen"
      :team-id="teamId"
      :timezone="timezone"
      @created="handleRecurrenceCreated"
    />
    <UiTeamsMeetingDialog
      v-model:open="editOpen"
      :team-id="teamId"
      :timezone="timezone"
      :booking="selectedBooking"
    />
    <UiTeamsMeetingActionDialog
      v-model:open="actionOpen"
      :team-id="teamId"
      :booking="selectedBooking"
      :action="action"
      @completed="handleActionCompleted"
    />
    <UiTeamsMeetingDetailsSheet
      v-model:open="detailsOpen"
      :team-id="teamId"
      :booking-id="linkedBookingId"
      :can-manage="canManage"
      @edit="openEdit"
      @cancel="openAction($event, 'cancel')"
      @delete="openAction($event, 'delete')"
    />
    <UiRecurrencesDetailsSheet
      :open="recurrenceDetailsOpen"
      :recurrence-id="linkedRecurrenceId"
      @update:open="setRecurrenceDetailsOpen"
      @deleted="handleRecurrenceDeleted"
    />
  </section>
</template>
