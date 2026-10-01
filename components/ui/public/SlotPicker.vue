<script setup lang="ts">
import type { PublicScheduleSlot } from "~/utils/api/public";

const props = defineProps<{
  heading: string;
  slots: PublicScheduleSlot[];
  selectedTime: string;
}>();
const emit = defineEmits<{
  select: [time: string];
  preview: [time: string];
  continue: [];
}>();

const slotList = ref<HTMLElement | null>(null);
const slotGrid = ref<HTMLElement | null>(null);
const highlightClip = ref<string | null>(null);
let resizeObserver: ResizeObserver | undefined;
let scrollFrame = 0;
let scrollTarget = 0;
let lastScrollTime = 0;

const stopFollowing = () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
};

const previewSlot = (event: PointerEvent, time: string) => {
  if (event.pointerType !== "mouse" || (!event.movementX && !event.movementY))
    return;
  emit("preview", time.slice(0, 5));
};

const followSelection = (time: number) => {
  const list = slotList.value;
  if (!list) return;
  const elapsed = Math.min(time - lastScrollTime, 64);
  lastScrollTime = time;
  const distance = scrollTarget - list.scrollTop;
  if (Math.abs(distance) <= 1) {
    list.scrollTop = scrollTarget;
    scrollFrame = 0;
    return;
  }

  list.scrollTop += distance * (1 - Math.exp(-elapsed / 55));
  scrollFrame = requestAnimationFrame(followSelection);
};

const centerSelection = () => {
  const list = slotList.value;
  const selected = slotGrid.value?.querySelector<HTMLButtonElement>(
    'button[aria-pressed="true"]',
  );
  if (!list || !selected) {
    stopFollowing();
    return;
  }
  scrollTarget = Math.max(
    0,
    Math.min(
      list.scrollHeight - list.clientHeight,
      selected.offsetTop + selected.offsetHeight / 2 - list.clientHeight / 2,
    ),
  );
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stopFollowing();
    list.scrollTop = scrollTarget;
  } else if (!scrollFrame) {
    lastScrollTime = performance.now();
    scrollFrame = requestAnimationFrame(followSelection);
  }
};

const positionHighlight = () => {
  const grid = slotGrid.value;
  const selected = grid?.querySelector<HTMLButtonElement>(
    'button[aria-pressed="true"]',
  );
  if (!grid || !selected) {
    highlightClip.value = null;
    return;
  }
  const {
    offsetTop: top,
    offsetLeft: left,
    offsetWidth: width,
    offsetHeight: height,
  } = selected;
  highlightClip.value = `inset(${top}px ${grid.clientWidth - left - width}px ${grid.clientHeight - top - height}px ${left}px round 8px)`;
};

watch(() => [props.selectedTime, props.slots], positionHighlight, {
  flush: "post",
});
watch(() => [props.selectedTime, props.slots], centerSelection, {
  flush: "post",
});
onMounted(() => {
  positionHighlight();
  resizeObserver = new ResizeObserver(positionHighlight);
  if (slotGrid.value) resizeObserver.observe(slotGrid.value);
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  stopFollowing();
});

const navigateSlots = (event: KeyboardEvent, index: number) => {
  if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key))
    return;
  const direction =
    event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
  event.preventDefault();
  const nextIndex = Math.max(
    0,
    Math.min(props.slots.length - 1, index + direction),
  );
  const slot = props.slots[nextIndex];
  if (!slot) return;
  slotList.value
    ?.querySelectorAll<HTMLButtonElement>("button")
    [nextIndex]?.focus({ preventScroll: true });
  emit("select", slot.time.slice(0, 5));
};

const label = (time: string) => {
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "pm" : "am"}`;
};
</script>

<template>
  <aside class="flex min-h-0 flex-col p-5 md:p-6">
    <div class="mb-5 flex items-center justify-between gap-3">
      <h2 class="text-sm font-medium">{{ heading }}</h2>
      <span class="slot-caption text-xs text-white/50">Available times</span>
    </div>
    <div
      ref="slotList"
      class="slot-list min-h-0 flex-1 overflow-y-auto pe-1"
      @mouseleave="$emit('preview', '')"
      @wheel.passive="stopFollowing"
      @touchstart.passive="stopFollowing"
      @pointerdown="stopFollowing"
    >
      <div
        ref="slotGrid"
        class="relative isolate grid grid-cols-2 content-start gap-2 md:grid-cols-1"
      >
        <button
          v-for="(slot, index) in slots"
          :key="slot.time"
          type="button"
          class="slot-button flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-150"
          :class="
            selectedTime === slot.time.slice(0, 5)
              ? 'border-transparent text-white'
              : 'border-white/15 bg-white/5 text-white/85 hover:border-white/50 hover:bg-white/10'
          "
          :aria-pressed="selectedTime === slot.time.slice(0, 5)"
          @pointermove="previewSlot($event, slot.time)"
          @focus="$emit('preview', slot.time.slice(0, 5))"
          @blur="$emit('preview', '')"
          @click="$emit('select', slot.time.slice(0, 5))"
          @keydown="navigateSlots($event, index)"
        >
          {{ label(slot.time) }}
        </button>
        <div
          v-if="highlightClip"
          aria-hidden="true"
          class="slot-highlight pointer-events-none absolute inset-0 grid grid-cols-2 content-start gap-2 bg-white md:grid-cols-1"
          :style="{ clipPath: highlightClip }"
        >
          <span
            v-for="slot in slots"
            :key="slot.time"
            class="relative flex min-h-10 items-center justify-center rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-900"
          >
            {{ label(slot.time) }}
            <span
              v-if="selectedTime === slot.time.slice(0, 5)"
              class="absolute right-3"
              >✓</span
            >
          </span>
        </div>
      </div>
    </div>
    <button
      type="button"
      class="mt-4 h-9 w-full rounded-lg bg-white px-4 text-sm font-semibold text-slate-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      :disabled="!selectedTime"
      @click="$emit('continue')"
    >
      {{ selectedTime ? "Continue →" : "Choose a time" }}
    </button>
  </aside>
</template>

<style scoped>
.slot-highlight {
  transition: clip-path 220ms var(--ease-out);
}
.slot-button:focus-visible {
  outline: 2px solid white;
  outline-offset: -2px;
}
@media (prefers-reduced-motion: reduce) {
  .slot-highlight {
    transition: none;
  }
}
.slot-list {
  overflow-anchor: none;
  scrollbar-width: thin;
  scrollbar-color: rgb(255 255 255 / 25%) transparent;
}
@media (max-width: 767px) {
  .slot-list {
    max-height: 250px;
  }
}
</style>
