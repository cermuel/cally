<script setup lang="ts">
const props = defineProps<{
  time: string;
  date: string;
  timezone: string;
  firstTime?: string;
  lastTime?: string;
  hideClock?: boolean;
}>();

const minutesOfDay = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// const cameraTransform = computed(() => {
//   const start = minutesOfDay(props.firstTime ?? "00:00");
//   const end = minutesOfDay(props.lastTime ?? "23:59");
//   const progress =
//     end > start
//       ? Math.max(
//           0,
//           Math.min(1, (minutesOfDay(props.time) - start) / (end - start)),
//         )
//       : 0.5;
//
//   return `translate3d(${(0.5 - progress) * 24}%, ${(progress - 0.5) * 3}%, 0) scale(1.28)`;
// });

const lightingStops = [
  { minute: 0, evening: 0, night: 1 },
  { minute: 300, evening: 0.35, night: 0.85 },
  { minute: 420, evening: 0.55, night: 0 },
  { minute: 720, evening: 0, night: 0 },
  { minute: 1080, evening: 1, night: 0 },
  { minute: 1320, evening: 0, night: 1 },
  { minute: 1440, evening: 0, night: 1 },
];
const lighting = computed(() => {
  const [hour = 9, minute = 0] = props.time.split(":").map(Number);
  const minutes = hour * 60 + minute;
  const endIndex = lightingStops.findIndex((stop) => stop.minute > minutes);
  const start = lightingStops[Math.max(0, endIndex - 1)]!;
  const end =
    lightingStops[endIndex] ?? lightingStops[lightingStops.length - 1]!;
  const progress = (minutes - start.minute) / (end.minute - start.minute);
  return {
    evening: start.evening + (end.evening - start.evening) * progress,
    night: start.night + (end.night - start.night) * progress,
  };
});
const clock = computed(() => {
  const [hours = "09", minutes = "00"] = props.time.split(":");
  return {
    time: `${Number(hours) % 12 || 12}:${minutes}`,
    period: Number(hours) >= 12 ? "PM" : "AM",
  };
});
const dateLabel = computed(() =>
  props.date
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date(`${props.date}T12:00:00`))
    : "Find a moment that works",
);
</script>

<template>
  <div class="scene" aria-hidden="true">
    <!-- :style="{ transform: cameraTransform }" disabled to keep the background still. -->
    <div class="scene-camera">
      <div class="scene-photo" />
      <div
        class="scene-light scene-evening"
        :style="{ opacity: lighting.evening }"
      />
      <div
        class="scene-light scene-night"
        :style="{ opacity: lighting.night }"
      />
    </div>
    <div class="scene-shade" />
  </div>
  <header v-if="!hideClock" class="scene-clock text-white">
    <p class="text-sm font-medium text-white/85">{{ dateLabel }}</p>
    <div class="mt-1 flex items-baseline justify-end gap-3">
      <span class="clock-digits">{{ clock.time }}</span>
      <span class="text-sm font-medium text-white/75">{{ clock.period }}</span>
    </div>
    <p class="mt-2 text-xs text-white/75">
      {{ timezone.replaceAll("_", " ") }}
    </p>
  </header>
</template>

<style scoped>
.scene {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: #233d4b;
}
.scene-camera {
  position: absolute;
  inset: 0;
  transform: scale(1.28);
  /* transition: transform 280ms var(--ease-out); */
  /* will-change: transform; */
}
.scene-photo {
  position: absolute;
  inset: 0;
  background: url("/images/booking-landscape.png") center / cover no-repeat;
}
.scene-light,
.scene-shade {
  position: absolute;
  inset: 0;
}
.scene-light {
  background-position: center;
  background-size: cover;
  transition: opacity 250ms var(--ease-out);
}
.scene-evening {
  background-image: url("/images/booking-evening.png");
}
.scene-night {
  background-image: url("/images/booking-night.png");
}
.scene-shade {
  background:
    linear-gradient(90deg, rgb(9 19 25 / 25%), transparent 75%),
    linear-gradient(0deg, rgb(9 19 25 / 35%), transparent 60%);
}
.scene-clock {
  position: absolute;
  top: 78px;
  right: max(40px, 5vw);
  text-align: right;
  text-shadow: 0 2px 24px rgb(0 0 0 / 20%);
}
.clock-digits {
  font-size: clamp(64px, 7vw, 112px);
  font-weight: 300;
  letter-spacing: -0.075em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 1100px) {
  .scene-clock {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .scene-camera {
    transform: none !important;
    transition: none;
    will-change: auto;
  }
  .scene-light {
    transition: none;
  }
}
</style>
