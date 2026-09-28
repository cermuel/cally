<script setup lang="ts">
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { PUBLIC_EVENT_FALLBACK_DESCRIPTIONS } from "~/constants/public-profile";
import {
  getPublicDescriptionFirstLine,
  type PublicEvent,
} from "~/utils/public-booking";

const props = defineProps<{
  events: PublicEvent[];
  isEmbed: boolean;
  pending: boolean;
  username: string;
}>();

const displayEvents = computed(() =>
  props.events.map((event, index) => ({
    ...event,
    preview: getPublicDescriptionFirstLine(
      event.description ||
        PUBLIC_EVENT_FALLBACK_DESCRIPTIONS[
          index % PUBLIC_EVENT_FALLBACK_DESCRIPTIONS.length
        ],
    ),
  })),
);
</script>

<template>
  <section class="mt-10" aria-labelledby="event-types-heading">
    <p id="event-types-heading" class="text-sm text-muted-foreground">
      Pick a meeting type to book a time.
    </p>

    <div class="mt-3">
      <div v-if="pending" class="space-y-2">
        <div
          v-for="item in 3"
          :key="item"
          class="h-24 rounded-xl bg-white/4 motion-safe:animate-pulse"
        />
      </div>

      <p
        v-else-if="!displayEvents.length"
        class="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-muted-foreground"
      >
        No event types yet. Check back soon.
      </p>

      <ul v-else class="space-y-2">
        <li v-for="event in displayEvents" :key="event.slug">
          <NuxtLink
            :to="{
              path: `/${username}/${event.slug}`,
              query: isEmbed ? { embed: 'true' } : undefined,
            }"
            class="group flex items-center gap-4 rounded-xl border border-white/8 bg-white/2 px-4 py-3.5 transition-colors hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <h2 class="text-[15px] font-medium leading-6 text-white">
                  {{ event.title }}
                </h2>
                <span
                  class="flex shrink-0 items-center gap-1.5 pt-1 text-xs font-medium text-white/60"
                >
                  <HugeiconsIcon
                    :icon="Clock01Icon"
                    :size="14"
                    color="currentColor"
                    :stroke-width="1.75"
                    aria-hidden="true"
                  />
                  {{ event.durationLabel }}
                </span>
              </div>
              <p
                v-if="event.preview"
                class="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground"
              >
                {{ event.preview }}
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
