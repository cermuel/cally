<script setup lang="ts">
import {
  ArrowRight01Icon,
  Clock01Icon,
  Link01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const profileEvents = [
  { title: "Quick chat", duration: "15 min" },
  { title: "Portfolio review", duration: "30 min" },
  { title: "Design critique", duration: "45 min" },
];

const days = [
  { label: "M", date: 21 },
  { label: "T", date: 22 },
  { label: "W", date: 23 },
  { label: "T", date: 24, selected: true },
  { label: "F", date: 25 },
];

const slots = [
  { time: "9:00 AM" },
  { time: "10:30 AM", selected: true },
  { time: "1:00 PM" },
  { time: "3:30 PM", busy: true },
];
</script>

<template>
  <section
    id="features"
    class="mx-auto w-full max-w-7xl scroll-mt-12 px-5 py-28 sm:px-8 sm:py-36 lg:px-10"
  >
    <div class="max-w-2xl">
      <p class="mb-3 text-sm font-medium text-muted-foreground">
        Made for real calendars
      </p>
      <h2
        class="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl"
      >
        Simple for guests. Powerful for you.
      </h2>
    </div>

    <div class="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-6">
      <!-- 1. Your link -->
      <article
        class="feature-card relative flex flex-col overflow-hidden rounded-3xl lg:col-span-3 lg:row-span-2"
      >
        <div class="p-6 sm:p-8">
          <h3 class="text-xl font-semibold tracking-[-0.02em] text-foreground">
            One link that feels like you
          </h3>
          <p class="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Share a clean personal page with your profile, meeting types, and
            the context guests need before booking.
          </p>
        </div>

        <div
          class="mt-auto px-6 pt-2 sm:px-10 [mask-image:linear-gradient(to_bottom,#000_62%,transparent)]"
          aria-hidden="true"
        >
          <div
            class="mx-auto w-full max-w-md rounded-t-2xl bg-muted p-5 pb-16 shadow-2xl outline outline-foreground/10 dark:bg-[#111] dark:outline-white/8"
          >
            <div
              class="flex items-center w-max mx-auto justify-center gap-2 rounded-full bg-foreground/5 px-3 py-1.5 text-[11px] text-muted-foreground dark:bg-white/5 dark:text-white/40"
            >
              <HugeiconsIcon
                :icon="Link01Icon"
                :size="12"
                :stroke-width="1.75"
              />
              cally.cermuel.dev/alex
            </div>

            <div class="mt-5 flex items-center gap-3">
              <SharedAvatar
                name="Alex Rivera"
                class="size-11 outline outline-foreground/10 dark:outline-white/10"
              />
              <div>
                <p
                  class="text-sm font-semibold text-foreground dark:text-white"
                >
                  Alex Rivera
                </p>
                <p class="text-xs text-muted-foreground dark:text-white/40">
                  @alex
                </p>
              </div>
            </div>
            <p
              class="mt-3 text-xs leading-5 text-muted-foreground dark:text-white/50"
            >
              Product designer. Office hours for portfolio reviews and design
              critiques.
            </p>

            <div class="mt-5 space-y-2">
              <div
                v-for="event in profileEvents"
                :key="event.title"
                class="flex items-center justify-between rounded-xl bg-foreground/[0.035] px-3.5 py-3 first:bg-foreground/[0.07] first:outline first:outline-foreground/10 dark:bg-white/[0.035] dark:first:bg-white/[0.07] dark:first:outline-white/10"
              >
                <span
                  class="text-[13px] font-medium text-foreground/85 dark:text-white/85"
                  >{{ event.title }}</span
                >
                <span
                  class="flex items-center gap-2 text-[11px] text-muted-foreground dark:text-white/40"
                >
                  <HugeiconsIcon
                    :icon="Clock01Icon"
                    :size="12"
                    :stroke-width="1.75"
                  />
                  {{ event.duration }}
                  <HugeiconsIcon
                    :icon="ArrowRight01Icon"
                    :size="13"
                    :stroke-width="1.75"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- 2. Availability -->
      <article
        class="feature-card relative overflow-hidden rounded-3xl lg:col-span-3"
      >
        <div
          class="grid gap-6 p-6 sm:grid-cols-[1fr_15rem] sm:items-center sm:p-8"
        >
          <div>
            <h3
              class="text-xl font-semibold tracking-[-0.02em] text-foreground"
            >
              Availability that protects your time
            </h3>
            <p class="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Define your weekly schedule once. Cally checks your calendar and
              only offers times that are actually free.
            </p>
          </div>

          <div
            class="rounded-xl bg-muted p-3 shadow-lg outline outline-foreground/10 dark:bg-[#111] dark:outline-white/8"
            aria-hidden="true"
          >
            <div
              class="flex items-center justify-between pb-3 text-[10px] text-muted-foreground dark:text-white/35"
            >
              <span class="flex items-center gap-1.5">
                <span class="size-1.5 rounded-full bg-emerald-400/80" />
                Calendar synced
              </span>
              <span>London · GMT+1</span>
            </div>

            <div class="grid grid-cols-5 gap-1.5">
              <div v-for="day in days" :key="day.date" class="text-center">
                <div
                  class="text-[9px] text-muted-foreground dark:text-white/25"
                >
                  {{ day.label }}
                </div>
                <div
                  class="mt-1.5 rounded-md py-1.5 text-[10px]"
                  :class="
                    day.selected
                      ? 'bg-foreground/12 text-foreground outline outline-foreground/15 dark:bg-white/12 dark:text-white dark:outline-white/15'
                      : 'bg-foreground/5 text-foreground/55 dark:bg-white/5 dark:text-white/55'
                  "
                >
                  {{ day.date }}
                </div>
              </div>
            </div>

            <div class="mt-3 space-y-1.5">
              <div
                v-for="slot in slots"
                :key="slot.time"
                class="rounded-lg px-3 py-1.5 text-center text-[10px] font-medium"
                :class="
                  slot.selected
                    ? 'bg-foreground text-background dark:bg-white dark:text-neutral-950'
                    : slot.busy
                      ? 'bg-foreground/[0.02] text-foreground/40 line-through dark:bg-white/[0.02] dark:text-white/20'
                      : 'bg-foreground/[0.04] text-foreground/60 dark:bg-white/[0.04] dark:text-white/60'
                "
              >
                {{ slot.time }}
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- 3. Confirmation -->
      <article
        class="feature-card relative overflow-hidden rounded-3xl lg:col-span-3"
      >
        <div
          class="grid gap-6 p-6 sm:grid-cols-[1fr_15rem] sm:items-center sm:p-8"
        >
          <div>
            <h3
              class="text-xl font-semibold tracking-[-0.02em] text-foreground"
            >
              Confirmed and in every calendar
            </h3>
            <p class="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              The event, Google Meet link, and confirmation details are created
              automatically for host and guest.
            </p>
          </div>

          <div
            class="rounded-xl bg-muted p-3.5 shadow-lg outline outline-foreground/10 dark:bg-[#111] dark:outline-white/8"
            aria-hidden="true"
          >
            <div class="flex items-center gap-2">
              <span
                class="flex size-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400"
              >
                <svg
                  viewBox="0 0 16 16"
                  class="size-3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m3.5 8.5 3 3 6-7" />
                </svg>
              </span>
              <span
                class="text-[11px] font-medium text-foreground/85 dark:text-white/85"
                >Meeting confirmed</span
              >
            </div>

            <div
              class="mt-3 border-t border-foreground/10 pt-3 dark:border-white/8"
            >
              <p
                class="text-xs font-medium text-foreground/85 dark:text-white/85"
              >
                Project planning
              </p>
              <p
                class="mt-1 text-[10px] text-muted-foreground dark:text-white/35"
              >
                Tomorrow · 10:30 AM
              </p>
            </div>

            <div
              class="mt-3 flex items-center gap-2 rounded-lg bg-foreground/5 px-2.5 py-2 text-[10px] text-muted-foreground dark:bg-white/5 dark:text-white/50"
            >
              <HugeiconsIcon
                :icon="Video01Icon"
                :size="12"
                :stroke-width="1.75"
              />
              Google Meet ready
            </div>

            <div class="mt-3 flex -space-x-1.5">
              <SharedAvatar
                name="Alex Rivera"
                class="size-6 ring-2 ring-muted dark:ring-[#111]"
              />
              <SharedAvatar
                name="Jordan Diaz"
                class="size-6 ring-2 ring-muted dark:ring-[#111]"
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.feature-card {
  background: linear-gradient(
    145deg,
    color-mix(in oklch, var(--foreground) 5.5%, transparent),
    color-mix(in oklch, var(--foreground) 1.8%, transparent)
  );
  box-shadow:
    0 1px 0 color-mix(in oklch, var(--foreground) 7%, transparent) inset,
    0 24px 80px oklch(0 0 0 / 16%);
  transition: box-shadow 150ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .feature-card:hover {
    box-shadow:
      0 1px 0 color-mix(in oklch, var(--foreground) 10%, transparent) inset,
      0 28px 88px oklch(0 0 0 / 22%);
  }
}
</style>
