<script setup lang="ts">
import type { PropType } from "vue";
import type { BreadcrumbItem } from "~/composables/useBreadcrumb";
import { ChevronRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

defineProps({
  items: {
    type: Array as PropType<readonly BreadcrumbItem[]>,
    required: true,
  },
});
</script>

<template>
  <nav class="min-w-0" aria-label="Breadcrumb">
    <ol
      class="flex min-w-0 flex-nowrap items-center gap-1 text-sm text-muted-foreground sm:gap-1.5"
    >
      <template v-for="(item, index) in items" :key="index">
        <li class="flex min-w-0 items-center">
          <NuxtLink
            v-if="item.route"
            :to="item.route"
            class="flex min-w-0 items-center gap-1.5 rounded-sm font-medium outline-none transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <HugeiconsIcon
              v-if="item.icon"
              :icon="item.icon"
              :size="16"
              :stroke-width="1.75"
              class="shrink-0"
              aria-hidden="true"
            />
            <span class="truncate">{{ item.title }}</span>
          </NuxtLink>
          <span
            v-else
            class="flex min-w-0 items-center gap-1.5 font-semibold text-foreground"
            :aria-current="index === items.length - 1 ? 'page' : undefined"
          >
            <HugeiconsIcon
              v-if="item.icon"
              :icon="item.icon"
              :size="16"
              :stroke-width="1.75"
              class="shrink-0"
              aria-hidden="true"
            />
            <span class="truncate">{{ item.title }}</span>
          </span>
        </li>
        <li
          v-if="index < items.length - 1"
          class="shrink-0"
          role="presentation"
          aria-hidden="true"
        >
          <HugeiconsIcon
            :icon="ChevronRightIcon"
            :size="14"
            :stroke-width="1.75"
          />
        </li>
      </template>
    </ol>
  </nav>
</template>
