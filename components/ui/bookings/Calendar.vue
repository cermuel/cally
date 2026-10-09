<script setup lang="ts">
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Booking } from "~/utils/api/bookings";

type Item = {
  booking: Booking;
  start: number;
  end: number;
  col: number;
  cols: number;
};

const props = defineProps<{
  bookings?: Booking[];
  loading: boolean;
}>();

const emit = defineEmits<{
  open: [booking: Booking];
}>();

const HOUR = 96; // px per hour
const PAD = 12;
const MAX_W = "16rem"; // max card width
const GAP = 6; // px between overlapping columns
const INSET = 4; // px between an event and the hour line it starts/ends on
const EMPTY_DAY_START_MINUTES = 8 * 60;
const SCROLL_LEAD = 60;

const scroller = ref<HTMLElement | null>(null);

const timezone = computed(
  () =>
    props.bookings?.find((b) => b.host?.timezone)?.host?.timezone ??
    Intl.DateTimeFormat().resolvedOptions().timeZone,
);

const dateKey = (date: Date, timeZone = timezone.value) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

const shiftKey = (key: string, days: number) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + days)).toISOString().slice(0, 10);
};

const minutesOfDay = (value: string | Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone.value,
  }).formatToParts(new Date(value));
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return get("hour") * 60 + get("minute");
};

const now = ref(new Date());
let timer: ReturnType<typeof setInterval>;
onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 60_000);
});
onBeforeUnmount(() => clearInterval(timer));

const todayKey = computed(() => dateKey(now.value));
const selectedKey = ref(dateKey(new Date()));
const visibleMonth = ref(
  (() => {
    const [y, m] = selectedKey.value.split("-").map(Number);
    return new Date(y!, m! - 1, 1);
  })(),
);

const monthLabel = computed(() =>
  new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    visibleMonth.value,
  ),
);

const selectedDateLabel = computed(() =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${selectedKey.value}T00:00:00Z`)),
);

const calendarDays = computed(() => {
  const year = visibleMonth.value.getFullYear();
  const month = visibleMonth.value.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(year, month, 1 - offset + i);
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    return {
      date,
      key,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
});

const bookingCountByDate = computed(() => {
  const counts = new Map<string, number>();
  for (const b of props.bookings ?? []) {
    if (!b.starts_at) continue;
    const key = dateKey(new Date(b.starts_at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
});

const statusCounts = computed(() => {
  const c = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  for (const b of props.bookings ?? []) c[b.status]++;
  return c;
});

const events = computed(() => {
  const items: Item[] = [];
  for (const booking of props.bookings ?? []) {
    if (
      !booking.starts_at ||
      dateKey(new Date(booking.starts_at)) !== selectedKey.value
    )
      continue;
    const start = minutesOfDay(booking.starts_at);
    const ms = booking.ends_at
      ? new Date(booking.ends_at).getTime() -
        new Date(booking.starts_at).getTime()
      : (booking.event?.duration_minutes ?? 30) * 60_000;
    const end = Math.min(24 * 60, start + Math.max(15, ms / 60_000));
    items.push({ booking, start, end, col: 0, cols: 1 });
  }
  items.sort((a, b) => a.start - b.start || b.end - a.end);

  let cluster: Item[] = [];
  let clusterEnd = 0;
  const flush = () => {
    const cols = Math.max(1, ...cluster.map((e) => e.col + 1));
    cluster.forEach((e) => (e.cols = cols));
    cluster = [];
  };
  for (const e of items) {
    if (cluster.length && e.start >= clusterEnd) flush();
    const taken = new Set(
      cluster.filter((c) => c.end > e.start).map((c) => c.col),
    );
    while (taken.has(e.col)) e.col++;
    cluster.push(e);
    clusterEnd = Math.max(clusterEnd, e.end);
  }
  flush();
  return items;
});

const DEFAULT_START = 1;
const DEFAULT_END = 23.8;

const startHour = computed(() =>
  Math.max(
    0,
    Math.min(
      DEFAULT_START,
      ...events.value.map((e) => Math.floor(e.start / 60)),
    ),
  ),
);
const endHour = computed(() =>
  Math.min(
    24,
    Math.max(DEFAULT_END, ...events.value.map((e) => Math.ceil(e.end / 60))),
  ),
);
const hours = computed(() =>
  Array.from(
    { length: endHour.value - startHour.value + 1 },
    (_, i) => startHour.value + i,
  ),
);

const nowMinutes = computed(() => minutesOfDay(now.value));
const showNow = computed(
  () =>
    selectedKey.value === todayKey.value &&
    nowMinutes.value >= startHour.value * 60 &&
    nowMinutes.value <= endHour.value * 60,
);
const hideLabel = (h: number) =>
  showNow.value && Math.abs(nowMinutes.value - h * 60) < 20;

const y = (minutes: number) =>
  PAD + ((minutes - startHour.value * 60) / 60) * HOUR;

// each column is min(equal share, MAX_W), with a gap between neighbours.
// top/height are inset so events never sit flush on an hour line
const eventStyle = (e: Item) => {
  const w = `min(${100 / e.cols}%, ${MAX_W})`;
  return {
    top: `${y(e.start) + INSET}px`,
    height: `${Math.max(24, ((e.end - e.start) / 60) * HOUR - INSET * 2)}px`,
    left: `calc(${w} * ${e.col} + ${GAP / 2}px)`,
    width: `calc(${w} - ${GAP}px)`,
  };
};

// with 96px/hr, 30 min is ~40px after inset, enough for two lines
const tall = (e: Item) => e.end - e.start >= 30;
const flipUp = (e: Item) =>
  e.start >= ((startHour.value + endHour.value) / 2) * 60;

const label12 = (h: number) =>
  `${h % 12 || 12}:00${h % 24 >= 12 ? "pm" : "am"}`;
const nowLabel = computed(() => {
  const m = nowMinutes.value;
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`;
});

const time24 = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone.value,
  }).format(new Date(value));

const guestName = (b: Booking) =>
  b.guests?.[0]?.name || b.guests?.[0]?.email || "";

const status: Record<
  Booking["status"],
  { label: string; bar: string; dot: string; surface: string; labelText: string }
> = {
  pending: {
    label: "Needs confirmation",
    bar: "before:bg-amber-500",
    dot: "bg-amber-500",
    surface: "border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/15",
    labelText: "text-amber-700 dark:text-amber-300",
  },
  confirmed: {
    label: "Confirmed",
    bar: "before:bg-emerald-500",
    dot: "bg-emerald-500",
    surface: "border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15",
    labelText: "text-emerald-700 dark:text-emerald-300",
  },
  completed: {
    label: "Completed",
    bar: "before:bg-blue-500",
    dot: "bg-blue-500",
    surface: "border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/15",
    labelText: "text-blue-700 dark:text-blue-300",
  },
  cancelled: {
    label: "Cancelled",
    bar: "before:bg-destructive",
    dot: "bg-destructive",
    surface:
      "border-destructive/30 border-dashed bg-destructive/5 hover:bg-destructive/10",
    labelText: "text-destructive",
  },
};

const legend = (Object.keys(status) as Booking["status"][]).map((key) => ({
  key,
  ...status[key],
}));

const selectDay = (key: string) => {
  selectedKey.value = key;
  const [yy, mm] = key.split("-").map(Number);
  if (
    yy !== visibleMonth.value.getFullYear() ||
    mm !== visibleMonth.value.getMonth() + 1
  )
    visibleMonth.value = new Date(yy!, mm! - 1, 1);
  void scrollToRelevant(true);
};
const moveDay = (n: number) => selectDay(shiftKey(selectedKey.value, n));
const moveMonth = (n: number) => {
  visibleMonth.value = new Date(
    visibleMonth.value.getFullYear(),
    visibleMonth.value.getMonth() + n,
    1,
  );
};
const selectToday = () => selectDay(todayKey.value);

const openDetails = (booking: Booking) => {
  emit("open", booking);
};

const scrollTopForMinutes = (minutes: number) =>
  Math.max(0, y(minutes) - SCROLL_LEAD);

const scrollToRelevant = async (animate = false) => {
  await nextTick();
  const el = scroller.value;
  if (!el) return;
  const target = events.value[0]?.start ?? EMPTY_DAY_START_MINUTES;
  const targetTop = scrollTopForMinutes(target);
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  el.scrollTo({
    top: targetTop,
    behavior: animate && !reduceMotion ? "smooth" : "auto",
  });
};
watch(() => props.loading, () => scrollToRelevant(), { flush: "post" });
onMounted(scrollToRelevant);
</script>

<template>
  <div class="min-h-0 flex-1">
    <div
      v-if="loading"
      class="grid h-full min-h-0 animate-pulse grid-cols-1 overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[15rem_minmax(0,1fr)]"
      aria-label="Loading calendar"
      aria-busy="true"
    >
      <div class="border-border bg-muted/30 md:border-e" />
      <div class="bg-muted/10" />
    </div>

    <section
      v-else
      class="grid h-full min-h-0 grid-cols-1 overflow-hidden rounded-lg border border-border bg-card text-foreground md:grid-cols-[15rem_minmax(0,1fr)]"
      aria-label="Booking calendar"
    >
      <aside
        class="flex flex-col border-b border-border p-3 md:border-b-0 md:border-e"
      >
        <div class="flex items-center justify-between">
          <h2 class="px-1 text-[13px] font-medium" aria-live="polite">
            {{ monthLabel }}
          </h2>
          <div class="flex items-center">
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous month"
              @click="moveMonth(-1)"
            >
              <HugeiconsIcon
                :icon="ArrowLeft01Icon"
                :size="14"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </SharedButton>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next month"
              @click="moveMonth(1)"
            >
              <HugeiconsIcon
                :icon="ArrowRight01Icon"
                :size="14"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </SharedButton>
          </div>
        </div>

        <div
          class="mt-3 grid grid-cols-7 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70"
        >
          <span
            v-for="(d, i) in ['M', 'T', 'W', 'T', 'F', 'S', 'S']"
            :key="`${d}-${i}`"
            >{{ d }}</span
          >
        </div>
        <div class="mt-1 grid grid-cols-7 gap-y-0.5">
          <button
            v-for="day in calendarDays"
            :key="day.key"
            type="button"
            class="relative mx-auto grid size-8 place-items-center rounded-md text-xs tabular-nums outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            :class="[
              day.inMonth ? 'text-foreground' : 'text-muted-foreground/40',
              day.key === todayKey &&
                day.key !== selectedKey &&
                'font-semibold text-primary',
              day.key === selectedKey &&
                'bg-primary font-medium text-primary-foreground hover:bg-primary',
            ]"
            :aria-label="
              day.date.toLocaleDateString('en-GB', { dateStyle: 'full' })
            "
            :aria-pressed="day.key === selectedKey"
            :aria-current="day.key === todayKey ? 'date' : undefined"
            @click="selectDay(day.key)"
          >
            {{ day.day }}
            <span
              v-if="bookingCountByDate.has(day.key)"
              class="absolute bottom-1 size-0.75 rounded-full"
              :class="
                day.key === selectedKey ? 'bg-primary-foreground' : 'bg-primary'
              "
              aria-hidden="true"
            />
          </button>
        </div>

        <div
          class="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground"
        >
          <div class="flex items-center justify-between pb-1">
            <span>All bookings</span>
            <span class="tabular-nums text-foreground">{{
              bookings?.length ?? 0
            }}</span>
          </div>
          <div
            v-for="item in legend"
            :key="item.key"
            class="flex items-center justify-between"
          >
            <span class="flex items-center gap-2">
              <span
                class="size-1.5 rounded-full"
                :class="item.dot"
                aria-hidden="true"
              />
              {{ item.label }}
            </span>
            <span class="tabular-nums">{{ statusCounts[item.key] }}</span>
          </div>
        </div>
      </aside>

      <div class="flex min-h-0 min-w-0 flex-col">
        <header
          class="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border px-4"
        >
          <div class="flex min-w-0 items-baseline gap-2">
            <h2 class="truncate text-[13px] font-medium" aria-live="polite">
              {{ selectedDateLabel }}
            </h2>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <SharedButton
              type="button"
              variant="outline"
              size="xs"
              @click="selectToday"
              >Today</SharedButton
            >
            <div class="flex items-center">
              <SharedButton
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Previous day"
                @click="moveDay(-1)"
              >
                <HugeiconsIcon
                  :icon="ArrowLeft01Icon"
                  :size="14"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
              </SharedButton>
              <SharedButton
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Next day"
                @click="moveDay(1)"
              >
                <HugeiconsIcon
                  :icon="ArrowRight01Icon"
                  :size="14"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
              </SharedButton>
            </div>
          </div>
        </header>

        <div ref="scroller" class="min-h-0 flex-1 overflow-y-auto">
          <div
            class="relative"
            :style="{ height: `${(endHour - startHour) * HOUR + PAD * 2}px` }"
          >
            <div
              v-for="h in hours"
              :key="h"
              class="absolute inset-s-0 w-16 pl-4 -translate-y-1/2 pe-2 text-end text-[11px] tabular-nums text-muted-foreground"
              :class="hideLabel(h) && 'invisible'"
              :style="{ top: `${PAD + (h - startHour) * HOUR}px` }"
            >
              {{ label12(h) }}
            </div>

            <div
              class="absolute inset-y-0 inset-s-20 inset-e-0 border-s border-border/60"
            >
              <div
                v-for="h in hours"
                :key="h"
                class="absolute inset-x-0 border-t border-border/60"
                :style="{ top: `${PAD + (h - startHour) * HOUR}px` }"
              />

              <div class="absolute inset-y-0 inset-s-0 inset-e-3">
                <div
                  v-for="e in events"
                  :key="e.booking.id"
                  class="group absolute focus-within:z-30 hover:z-30"
                  :style="eventStyle(e)"
                >
                  <button
                    type="button"
                    class="relative flex size-full flex-col justify-center overflow-hidden rounded-md border ps-3.5 pe-2 text-start outline-none transition-colors before:absolute before:inset-y-1 before:inset-s-1 before:w-0.75 before:rounded-full hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring"
                    :class="[
                      status[e.booking.status].bar,
                      status[e.booking.status].surface,
                    ]"
                    :aria-label="`View details for ${e.booking.event?.name ?? `Event ${e.booking.event_id}`}`"
                    @click="openDetails(e.booking)"
                  >
                    <span class="block truncate text-xs leading-5">
                      <span
                        class="font-medium"
                        :class="
                          e.booking.status === 'cancelled' && 'line-through'
                        "
                      >
                        {{
                          e.booking.event?.name ??
                          `Event #${e.booking.event_id}`
                        }}
                      </span>
                      <span
                        v-if="!tall(e)"
                        class="ms-1.5 tabular-nums text-muted-foreground"
                      >
                        {{ time24(e.booking.starts_at!) }}
                      </span>
                    </span>
                    <span
                      v-if="tall(e)"
                      class="block truncate text-[11px] leading-4 tabular-nums text-muted-foreground"
                    >
                      {{ time24(e.booking.starts_at!)
                      }}<template v-if="e.booking.ends_at">
                        - {{ time24(e.booking.ends_at) }}</template
                      >
                      <template v-if="guestName(e.booking)">
                        · {{ guestName(e.booking) }}</template
                      >
                    </span>
                  </button>

                  <div
                    class="invisible absolute inset-s-2 z-30 w-72 max-w-[calc(100vw-2rem)] opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                    :class="
                      flipUp(e) ? 'bottom-full pb-1.5' : 'top-full pt-1.5'
                    "
                  >
                    <div
                      class="rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg"
                    >
                      <div class="flex items-start gap-2.5">
                        <span
                          class="mt-1 h-3.5 w-1 shrink-0 rounded-full"
                          :class="status[e.booking.status].dot"
                          aria-hidden="true"
                        />
                        <div class="min-w-0">
                          <p class="text-[13px] font-medium leading-snug">
                            {{
                              e.booking.event?.name ??
                              `Event #${e.booking.event_id}`
                            }}
                          </p>
                          <p
                            class="mt-1 text-xs tabular-nums text-muted-foreground"
                          >
                            {{ time24(e.booking.starts_at!)
                            }}<template v-if="e.booking.ends_at">
                              - {{ time24(e.booking.ends_at) }}</template
                            >
                          </p>
                          <p
                            v-if="e.booking.guests?.[0]"
                            class="mt-0.5 truncate text-xs text-muted-foreground"
                          >
                            {{ guestName(e.booking) }}
                            <template v-if="e.booking.guests.length > 1">
                              +{{ e.booking.guests.length - 1 }}</template
                            >
                          </p>
                          <p
                            class="mt-1.5 text-xs font-medium"
                            :class="status[e.booking.status].labelText"
                          >
                            {{ status[e.booking.status].label }}
                          </p>
                        </div>
                      </div>
                      <a
                        v-if="
                          e.booking.meeting_url &&
                          e.booking.status === 'confirmed'
                        "
                        :href="e.booking.meeting_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mt-3 inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <HugeiconsIcon
                          :icon="Video01Icon"
                          :size="12"
                          :stroke-width="1.75"
                          aria-hidden="true"
                        />
                        Join
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="showNow"
                class="pointer-events-none absolute inset-x-0 z-20 h-px bg-foreground"
                :style="{ top: `${y(nowMinutes)}px` }"
                aria-hidden="true"
              />
            </div>

            <span
              v-if="showNow"
              class="pointer-events-none absolute inset-s-0 z-20 w-16 -translate-y-1/2 pe-2 text-end text-[11px] tabular-nums text-foreground"
              :style="{ top: `${y(nowMinutes)}px` }"
              aria-hidden="true"
            >
              {{ nowLabel }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
