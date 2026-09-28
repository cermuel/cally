<script setup lang="ts">
import { Clock01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

defineProps<{
  hostName: string;
  hostImage?: string;
  title: string;
  description?: string;
  durationLabel: string;
}>();
</script>

<template>
  <aside
    class="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
  >
    <div class="flex items-center gap-2">
      <UiPublicProfileAvatar :image="hostImage" :name="hostName" size="sm" />
      <p class="text-sm font-medium text-muted-foreground">
        {{ hostName }}
      </p>
    </div>

    <h1
      class="text-2xl font-medium leading-tight tracking-normal text-foreground"
    >
      {{ title }}
    </h1>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div class="flex items-center gap-1.5">
        <dt class="text-foreground">
          <HugeiconsIcon
            :icon="Clock01Icon"
            :size="18"
            color="currentColor"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          <span class="sr-only">Duration</span>
        </dt>
        <dd>{{ durationLabel }}</dd>
      </div>
      <div class="flex items-center gap-1.5">
        <dt
          class="grid size-5 place-items-center rounded bg-muted text-foreground"
        >
          <HugeiconsIcon
            :icon="Video01Icon"
            :size="15"
            color="currentColor"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          <span class="sr-only">Location</span>
        </dt>
        <dd>Google Meet</dd>
      </div>
    </div>
  </aside>
</template>
