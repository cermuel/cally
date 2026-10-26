<script setup lang="ts">
import {
  ArrowRight01Icon,
  CalendarAdd02Icon,
  CalendarSyncIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    buttonClass?: HTMLAttributes["class"];
    context?: "personal" | "team";
  }>(),
  { label: "New meeting", context: "personal" },
);

const emit = defineEmits<{
  once: [];
  recurring: [];
}>();

const open = ref(false);

const items = computed(() => [
  {
    kind: "once",
    label: "One-time meeting",
    description:
      props.context === "team"
        ? "Pick a date and time for the team."
        : "Pick a contact, date, and time.",
    icon: CalendarAdd02Icon,
  },
  {
    kind: "recurring",
    label: "Recurring series",
    description: "Set a schedule that repeats.",
    icon: CalendarSyncIcon,
  },
] as const);

const choose = (kind: "once" | "recurring") => {
  open.value = false;
  if (kind === "once") emit("once");
  else emit("recurring");
};
</script>

<template>
  <SharedPopover v-model:open="open">
    <SharedPopoverTrigger as-child>
      <SharedButton type="button" :class="buttonClass">
        <HugeiconsIcon
          :icon="PlusSignIcon"
          :size="18"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        {{ label }}
      </SharedButton>
    </SharedPopoverTrigger>

    <SharedPopoverContent
      align="end"
      :side-offset="8"
      class="w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border-border/80 p-2 shadow-[0_18px_50px_oklch(0_0_0/0.14),0_2px_8px_oklch(0_0_0/0.06)]"
    >
      <div class="grid gap-1">
        <button
          v-for="item in items"
          :key="item.kind"
          type="button"
          class="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left outline-none transition-[background-color,box-shadow,transform] duration-150 hover:bg-accent active:scale-96 focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-popover"
          @click="choose(item.kind)"
        >
          <span
            class="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm"
          >
            <HugeiconsIcon
              :icon="item.icon"
              :size="16"
              :stroke-width="1.75"
              aria-hidden="true"
            />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-medium">{{ item.label }}</span>
            <span
              class="mt-0.5 block text-xs leading-4.5 text-muted-foreground"
            >
              {{ item.description }}
            </span>
          </span>
          <HugeiconsIcon
            :icon="ArrowRight01Icon"
            :size="17"
            :stroke-width="1.75"
            class="shrink-0 text-muted-foreground/60 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-foreground group-focus-visible:translate-x-0.5 group-focus-visible:text-foreground rtl:rotate-180"
            aria-hidden="true"
          />
        </button>
      </div>
    </SharedPopoverContent>
  </SharedPopover>
</template>
