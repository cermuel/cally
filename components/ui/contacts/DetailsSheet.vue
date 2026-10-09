<script setup lang="ts">
import {
  Calendar03Icon,
  Edit02Icon,
  RefreshCcwIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Booking } from "~/utils/api/bookings";
import type { Contact } from "~/utils/api/contacts";

const props = defineProps<{
  contactId: number | null;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  edit: [contact: Contact];
  schedule: [contact: Contact];
}>();

const page = ref(1);
const params = computed(() => ({ page: page.value, per_page: 15 }));
const contactId = computed(() => props.contactId);
const contactQuery = useContactBookings(contactId, params);
const contact = computed(() => contactQuery.data.value?.contact ?? null);
const bookings = computed(() => contact.value?.bookings ?? []);
const pagination = computed(() => contactQuery.data.value?.pagination);

watch(
  () => props.contactId,
  () => {
    page.value = 1;
  },
);

const displayName = computed(() =>
  contact.value
    ? contact.value.name ||
      contact.value.platformUser?.name ||
      contact.value.email
    : "",
);

const properties = computed(() => {
  const c = contact.value;
  if (!c) return [];
  return [
    { label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.phone && { label: "Phone", value: c.phone, href: `tel:${c.phone}` },
    c.company && { label: "Company", value: c.company },
    c.timezone && { label: "Timezone", value: c.timezone },
    { label: "Bookings", value: String(c.bookings_count) },
    { label: "Last booked", value: formatDate(c.last_booked_at) },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];
});

const formatDate = (value: string | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
};

const formatBookingDate = (booking: Booking) => {
  if (!booking.starts_at) return "Date to be confirmed";

  const timeZone = booking.booking_timezone || contact.value?.timezone;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(booking.starts_at));
};

const bookingTitle = (booking: Booking) =>
  booking.event?.name ?? `Event #${booking.event_id}`;

const statusLabel = (status: Booking["status"]) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const statusDot: Record<Booking["status"], string> = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  completed: "bg-muted-foreground/50",
  cancelled: "bg-destructive",
};

const editContact = () => {
  if (!contact.value) return;
  emit("edit", contact.value);
  open.value = false;
};

const scheduleBooking = () => {
  if (!contact.value) return;
  emit("schedule", contact.value);
  open.value = false;
};
</script>

<template>
  <SharedSheet
    v-model:open="open"
    title="Contact details"
    description="Contact information and booking history"
    close-label="Close contact details"
    size="compact"
  >
    <template #actions>
          <SharedButton
            v-if="contact"
            type="button"
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-foreground"
            @click="editContact"
          >
            <HugeiconsIcon
              :icon="Edit02Icon"
              :size="15"
              :stroke-width="1.75"
              aria-hidden="true"
            />
            Edit
          </SharedButton>
    </template>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <!-- loading -->
          <div
            v-if="contactQuery.isPending.value"
            class="space-y-6 p-5"
            aria-label="Loading contact details"
            aria-busy="true"
          >
            <div class="flex items-center gap-3">
              <div class="size-10 animate-pulse rounded-full bg-muted" />
              <div class="flex-1 space-y-2">
                <div class="h-3.5 w-32 animate-pulse rounded bg-muted" />
                <div class="h-3 w-44 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div class="h-8 animate-pulse rounded-md bg-muted" />
            <div class="space-y-3">
              <div
                v-for="index in 5"
                :key="index"
                class="h-3.5 animate-pulse rounded bg-muted"
              />
            </div>
            <div class="space-y-2">
              <div
                v-for="index in 3"
                :key="index"
                class="h-12 animate-pulse rounded-md bg-muted"
              />
            </div>
          </div>

          <!-- error -->
          <div
            v-else-if="contactQuery.isError.value"
            class="grid min-h-72 place-items-center p-6 text-center"
          >
            <div>
              <p class="text-sm font-medium">Could not load this contact</p>
              <p class="mt-1 text-xs text-muted-foreground">
                Check your connection and try again.
              </p>
              <SharedButton
                type="button"
                variant="outline"
                size="sm"
                class="mt-4"
                @click="contactQuery.refetch()"
              >
                <HugeiconsIcon
                  :icon="RefreshCcwIcon"
                  :size="15"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
                Try again
              </SharedButton>
            </div>
          </div>

          <!-- content -->
          <template v-else-if="contact">
            <section class="p-5" aria-label="Contact overview">
              <div class="flex items-center gap-3">
                <UiPublicProfileAvatar
                  :image="contact.platformUser?.avatar ?? undefined"
                  :name="displayName"
                  class="size-10!"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <p class="truncate text-sm font-medium">
                      {{ displayName }}
                    </p>
                    <span
                      v-if="contact.tag"
                      class="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary"
                    >
                      {{ contact.tag }}
                    </span>
                  </div>
                  <p class="mt-0.5 truncate text-xs text-muted-foreground">
                    {{ contact.email }}
                  </p>
                </div>
              </div>

              <SharedButton
                type="button"
                size="sm"
                class="mt-4 w-full"
                @click="scheduleBooking"
              >
                <HugeiconsIcon
                  :icon="Calendar03Icon"
                  :size="15"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
                Schedule booking
              </SharedButton>
            </section>

            <section
              class="border-t border-border px-5 py-4"
              aria-labelledby="contact-properties-heading"
            >
              <dl class="space-y-2.5 text-[13px]">
                <div
                  v-for="item in properties"
                  :key="item.label"
                  class="grid grid-cols-[88px_1fr] items-baseline gap-3"
                >
                  <dt class="text-muted-foreground">{{ item.label }}</dt>
                  <dd class="min-w-0 wrap-break-word">
                    <a
                      v-if="item.href"
                      :href="item.href"
                      class="hover:underline"
                    >
                      {{ item.value }}
                    </a>
                    <template v-else>{{ item.value }}</template>
                  </dd>
                </div>
              </dl>
            </section>

            <section
              v-if="contact.notes"
              class="border-t border-border px-5 py-4"
              aria-labelledby="contact-notes-heading"
            >
              <h2
                id="contact-notes-heading"
                class="text-xs font-medium text-muted-foreground"
              >
                Notes
              </h2>
              <p
                class="mt-3 whitespace-pre-wrap wrap-break-word text-[13px] leading-6"
              >
                {{ contact.notes }}
              </p>
            </section>

            <section
              class="border-t border-border px-5 py-4"
              aria-labelledby="contact-bookings-heading"
            >
              <div class="flex items-center justify-between gap-3">
                <h2
                  id="contact-bookings-heading"
                  class="text-xs font-medium text-muted-foreground"
                >
                  Booking history
                </h2>
                <span class="text-xs tabular-nums text-muted-foreground">
                  {{ pagination?.total ?? contact.bookings_count }}
                </span>
              </div>

              <ul
                v-if="bookings.length"
                class="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border"
              >
                <li
                  v-for="booking in bookings"
                  :key="booking.id"
                  class="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[13px] font-medium">
                      {{ bookingTitle(booking) }}
                    </p>
                    <p class="mt-0.5 text-xs text-muted-foreground">
                      {{ formatBookingDate(booking) }}
                    </p>
                  </div>
                  <span
                    class="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      class="size-1.5 rounded-full"
                      :class="statusDot[booking.status]"
                      aria-hidden="true"
                    />
                    {{ statusLabel(booking.status) }}
                  </span>
                </li>
              </ul>

              <div
                v-else
                class="mt-3 rounded-lg border border-dashed border-border px-5 py-8 text-center"
              >
                <HugeiconsIcon
                  :icon="Calendar03Icon"
                  :size="18"
                  :stroke-width="1.75"
                  class="mx-auto text-muted-foreground"
                  aria-hidden="true"
                />
                <p class="mt-2 text-[13px] font-medium">No bookings yet</p>
                <p class="mt-0.5 text-xs text-muted-foreground">
                  This contact’s meetings will appear here.
                </p>
              </div>

              <nav
                v-if="pagination && pagination.last_page > 1"
                class="mt-3 flex items-center justify-between gap-3"
                aria-label="Contact booking pages"
              >
                <SharedButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  :disabled="
                    pagination.current_page === 1 ||
                    contactQuery.isFetching.value
                  "
                  @click="page = pagination.current_page - 1"
                >
                  Previous
                </SharedButton>
                <span class="text-xs tabular-nums text-muted-foreground">
                  {{ pagination.current_page }} / {{ pagination.last_page }}
                </span>
                <SharedButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  :disabled="
                    pagination.current_page === pagination.last_page ||
                    contactQuery.isFetching.value
                  "
                  @click="page = pagination.current_page + 1"
                >
                  Next
                </SharedButton>
              </nav>
            </section>
          </template>
        </div>
  </SharedSheet>
</template>
