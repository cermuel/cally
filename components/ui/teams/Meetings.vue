<script setup lang="ts">
import {
  Add01Icon,
  Calendar03Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { BookingScope } from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import type {
  TeamBooking,
  TeamBookingListParams,
} from "~/utils/api/team-bookings";

const props = defineProps<{
  teamId: number;
  canManage: boolean;
  timezone: string;
}>();

const route = useRoute();
const router = useRouter();
const page = ref(1);
const perPage = ref(10);
const scope = ref<BookingScope>("all");
const searchInput = ref("");
const search = ref("");
const searching = ref(false);
const createOpen = ref(false);
const editOpen = ref(false);
const actionOpen = ref(false);
const action = ref<"cancel" | "delete">("cancel");
const selectedBooking = ref<TeamBooking | null>(null);

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
const params = computed<TeamBookingListParams>(() => ({
  page: page.value,
  per_page: perPage.value,
  ...(scope.value === "pending" ? { status: "pending" as const } : {}),
  ...(scope.value === "cancelled" ? { status: "cancelled" as const } : {}),
  ...(search.value ? { search: search.value } : {}),
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

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const nextSearch = value.trim();
    if (nextSearch === search.value) return;
    searching.value = true;
    search.value = nextSearch;
    page.value = 1;
  }, 300);
});

watch(
  () => bookingsQuery.isFetching.value,
  (isFetching) => {
    if (!isFetching) searching.value = false;
  },
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
const handleActionCompleted = () => {
  selectedBooking.value = null;
  if (linkedBookingId.value !== null) {
    void router.replace({ query: { ...route.query, booking_id: undefined } });
  }
};
</script>

<template>
  <section aria-labelledby="team-meetings-heading">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[minmax(0,24rem)_minmax(0,1fr)_auto]"
    >
      <SharedInput
        v-model="searchInput"
        type="search"
        class="col-start-1 row-start-1 min-w-0"
        placeholder="Search meetings"
        aria-label="Search meetings"
        :loading="searching"
      >
        <template #prefix>
          <span
            class="flex size-9 shrink-0 items-center justify-center text-muted-foreground"
          >
            <HugeiconsIcon
              :icon="Search01Icon"
              :size="16"
              :stroke-width="1.75"
              aria-hidden="true"
            />
          </span>
        </template>
      </SharedInput>
      <UiBookingsTabs
        v-model="scope"
        class="col-span-2 row-start-2 w-full sm:col-span-1 sm:col-start-2 sm:row-start-1"
      />

      <SharedButton
        v-if="canManage"
        type="button"
        class="col-start-2 row-start-1 shrink-0 sm:col-start-3"
        @click="createOpen = true"
      >
        <HugeiconsIcon :icon="Add01Icon" :size="17" aria-hidden="true" />
        New meeting
      </SharedButton>
    </div>

    <div
      v-if="bookingsQuery.isError.value"
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
      v-else-if="bookingsQuery.isPending.value"
      class="mt-5 space-y-3"
      aria-label="Loading team meetings"
    >
      <div
        v-for="index in 3"
        :key="index"
        class="h-40 animate-pulse rounded-xl border border-border bg-muted/50"
      />
    </div>

    <div v-else-if="bookings.length" class="mt-5">
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
      v-else
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
          scope !== "all" || search
            ? "Try clearing the active filters."
            : canManage
              ? "Create a meeting to bring the team together."
              : "An owner or admin can create the first meeting."
        }}
      </p>
      <SharedButton
        v-if="canManage && scope === 'all' && !search"
        type="button"
        class="mt-5"
        @click="createOpen = true"
        >New meeting</SharedButton
      >
    </div>

    <UiTeamsMeetingDialog
      v-model:open="createOpen"
      :team-id="teamId"
      :timezone="timezone"
      @completed="handleCreated"
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
  </section>
</template>
