<script setup lang="ts">
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
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
  props.events.map((event) => ({
    ...event,
    preview: getPublicDescriptionFirstLine(event.description),
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
          class="h-24 rounded-xl bg-muted motion-safe:animate-pulse"
        />
      </div>

      <p
        v-else-if="!displayEvents.length"
        class="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground"
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
            class="group flex items-center gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3.5 transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <h2 class="text-[15px] font-medium leading-6 text-foreground">
                  {{ event.title }}
                </h2>
                <span
                  class="flex shrink-0 items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground"
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
