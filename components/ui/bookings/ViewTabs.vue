<script setup lang="ts">
import { Calendar03Icon, ListViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

export type BookingsView = "list" | "calendar";

const view = defineModel<BookingsView>({ required: true });
</script>

<template>
  <SharedTabs v-model="view" class="hidden md:flex">
    <SharedTabsList aria-label="Booking view">
      <SharedTabsTrigger value="list" class="px-3">
        <HugeiconsIcon
          :icon="ListViewIcon"
          :size="16"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </SharedTabsTrigger>
      <SharedTabsTrigger value="calendar" class="px-3">
        <HugeiconsIcon
          :icon="Calendar03Icon"
          :size="16"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </SharedTabsTrigger>
    </SharedTabsList>
  </SharedTabs>
</template>
