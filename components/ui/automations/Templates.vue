<script setup lang="ts">
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { getAutomationAction } from "~/constants/automations";
import type { AutomationTemplate } from "~/utils/api/automations";

defineProps<{
  templates: AutomationTemplate[];
  loading: boolean;
}>();

const emit = defineEmits<{
  select: [template: AutomationTemplate];
}>();
</script>

<template>
  <section class="mt-12" aria-labelledby="templates-heading">
    <div class="mb-4">
      <h2 id="templates-heading" class="text-sm font-medium">Templates</h2>
      <p class="mt-0.5 text-[13px] text-muted-foreground">
        Start from a ready-made workflow and customise it before creating.
      </p>
    </div>

    <div
      v-if="loading"
      class="grid max-sm:grid-cols-1 gap-3 max-lg:grid-cols-2 grid-cols-3"
    >
      <div
        v-for="index in 6"
        :key="index"
        class="hidden sm:flex h-48 animate-pulse flex-col gap-3 rounded-lg border border-border bg-card p-4"
      >
        <div class="size-8 rounded-md bg-muted" />
        <div class="h-3 w-1/2 rounded bg-muted" />
        <div class="space-y-2">
          <div class="h-3 w-full rounded bg-muted/60" />
          <div class="h-3 w-3/4 rounded bg-muted/60" />
        </div>
        <div class="mt-auto h-8 w-20 rounded-md bg-muted/60" />
      </div>
      <div
        v-for="index in 2"
        :key="index"
        class="hidden max-sm:flex h-48 animate-pulse flex-col gap-3 rounded-lg border border-border bg-card p-4"
      >
        <div class="size-8 rounded-md bg-muted" />
        <div class="h-3 w-1/2 rounded bg-muted" />
        <div class="space-y-2">
          <div class="h-3 w-full rounded bg-muted/60" />
          <div class="h-3 w-3/4 rounded bg-muted/60" />
        </div>
        <div class="mt-auto h-8 w-20 rounded-md bg-muted/60" />
      </div>
    </div>

    <div v-else class="grid max-sm:grid-cols-1 gap-3 grid-cols-2">
      <article
        v-for="template in templates"
        :key="template.key"
        class="group flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20"
      >
        <span
          class="flex size-8 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground transition-colors group-hover:text-foreground"
        >
          <HugeiconsIcon
            v-if="getAutomationAction(template.action)"
            :icon="getAutomationAction(template.action)!.icon"
            :size="16"
            :stroke-width="1.75"
            aria-hidden="true"
          />
        </span>

        <h3 class="mt-4 truncate text-sm font-medium">{{ template.name }}</h3>
        <p
          class="mt-1 mb-5 line-clamp-3 text-[13px] leading-5 text-muted-foreground"
        >
          {{ template.description }}
        </p>

        <SharedButton
          type="button"
          class="mt-auto w-max"
          size="sm"
          @click="emit('select', template)"
        >
          Use Template
        </SharedButton>
      </article>
    </div>
  </section>
</template>
