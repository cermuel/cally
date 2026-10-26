<script setup lang="ts">
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Team } from "~/utils/api/teams";

const props = defineProps<{ team: Team }>();

const MAX = 3;
const CARD_DELAY = 2000;
const CARD_W = 184;
const CARD_H = 50;
const GAP = 6;

const members = computed(() => (props.team.members ?? []) as any[]);
const shown = computed(() => members.value.slice(0, MAX));
const extra = computed(() => members.value.length - MAX);

const memberName = (m: any, i: number) =>
  m.name ?? m.user?.name ?? m.email ?? `${props.team.id}-${i}`;
const memberImage = (m: any) => m.avatar_url ?? m.user?.avatar ?? undefined;
const memberEmail = (m: any) => m.email ?? m.user?.email ?? "";

const description = computed(
  () =>
    props.team.description
      ?.replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "A shared space for your team.",
);

const hash = (s: string) =>
  [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const rng = (s: number) => () =>
  (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;

const seed = computed(() => hash(String(props.team.id ?? props.team.name)));

const bouncers = computed(() =>
  shown.value.map((_, i) => {
    const r = rng(hash(`${seed.value}-${i}`));
    const dx = 2.2 + r() * 2;
    const dy = 1.6 + r() * 1.8;
    return {
      x: `--dx:${dx.toFixed(2)}s;--ox:-${(r() * dx).toFixed(2)}s`,
      y: `--dy:${dy.toFixed(2)}s;--oy:-${(r() * dy).toFixed(2)}s`,
    };
  }),
);

const panel = ref<HTMLElement>();
const hover = reactive({ i: 0, x: 0, y: 0, open: false });
const raf = new WeakMap<Element, number>();
let timer: ReturnType<typeof setTimeout> | undefined;

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), Math.max(min, max));

// `el` must be the inner .by (it carries the Y movement)
const place = (el: HTMLElement) => {
  if (!panel.value) return;
  const p = panel.value.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const left = r.left - p.left;
  const top = r.top - p.top;

  const below = p.height - (top + r.height);
  const toBottom = below >= CARD_H + GAP || below >= top;
  const y = toBottom ? top + r.height + GAP : top - CARD_H - GAP;

  const centered = left + r.width / 2 - CARD_W / 2;
  let x = centered;
  if (centered < GAP)
    x = left; // near left wall: extend right
  else if (centered + CARD_W > p.width - GAP) x = left + r.width - CARD_W; // near right wall: extend left

  hover.x = clamp(x, GAP, p.width - CARD_W - GAP);
  hover.y = clamp(y, GAP, p.height - CARD_H - GAP);
};

const ramp = (el: HTMLElement, to: number) => {
  cancelAnimationFrame(raf.get(el) ?? 0);
  const anims = el.getAnimations({ subtree: true });
  const from = anims[0]?.playbackRate ?? 1;
  const t0 = performance.now();
  const D = 450;
  const step = (t: number) => {
    const k = Math.min((t - t0) / D, 1);
    const e = 1 - (1 - k) ** 3;
    anims.forEach((a) => (a.playbackRate = from + (to - from) * e));
    if (k < 1) raf.set(el, requestAnimationFrame(step));
  };
  raf.set(el, requestAnimationFrame(step));
};

const enter = (e: MouseEvent, i: number) => {
  const el = e.currentTarget as HTMLElement;
  const avatar = el.querySelector<HTMLElement>(".by") ?? el;
  ramp(el, 0);
  clearTimeout(timer);
  timer = setTimeout(() => {
    hover.i = i;
    place(avatar);
    hover.open = true;
  }, CARD_DELAY);
};
const leave = (e: MouseEvent) => {
  clearTimeout(timer);
  hover.open = false;
  ramp(e.currentTarget as HTMLElement, 1);
};

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <NuxtLink
    :to="`/app/teams/${team.slug}`"
    class="group flex flex-col rounded-2xl border border-border bg-card p-2 outline-none transition-colors"
  >
    <div
      ref="panel"
      class="relative h-44 overflow-hidden rounded-xl bg-muted @container-size dark:bg-black"
    >
      <div
        v-for="(m, i) in shown"
        :key="i"
        class="bx absolute left-0 top-0"
        :style="bouncers[i]?.x"
        @mouseenter="enter($event, i)"
        @mouseleave="leave"
      >
        <div class="by" :style="bouncers[i]?.y">
          <SharedAvatar
            :name="memberName(m, i)"
            :image="memberImage(m)"
            class="size-8 border-2 border-muted dark:border-black"
          />
        </div>
      </div>

      <SharedAvatar
        v-if="!members.length"
        :name="team.name"
        :image="team.avatar_url || undefined"
        class="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border"
      />

      <div
        v-if="shown[hover.i]"
        class="pointer-events-none absolute left-0 top-0 z-10 flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg transition-opacity duration-200"
        :class="hover.open ? 'opacity-100' : 'opacity-0'"
        :style="`width:${CARD_W}px;height:${CARD_H}px;transform:translate(${hover.x}px,${hover.y}px)`"
      >
        <SharedAvatar
          :name="memberName(shown[hover.i], hover.i)"
          :image="memberImage(shown[hover.i])"
          class="size-8 shrink-0"
        />
        <div class="min-w-0">
          <p class="truncate text-xs font-semibold">
            {{ memberName(shown[hover.i], hover.i) }}
          </p>
          <p class="truncate text-[11px] text-muted-foreground">
            {{ memberEmail(shown[hover.i]) }}
          </p>
        </div>
      </div>

      <span
        v-if="extra > 0"
        class="absolute bottom-3 right-3 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
      >
        +{{ extra }} more
      </span>
    </div>

    <div class="flex items-center gap-2 p-2 pt-2.5">
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 class="truncate text-sm font-semibold tracking-tight">
          {{ team.name }}
        </h2>
        <p class="line-clamp-1 text-xs text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <span
        class="shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        <HugeiconsIcon
          :icon="ArrowUpRight01Icon"
          :size="21"
          :stroke-width="2"
          aria-hidden="true"
        />
      </span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.bx {
  animation: bx var(--dx) linear infinite alternate;
  animation-delay: var(--ox);
}
.by {
  animation: by var(--dy) linear infinite alternate;
  animation-delay: var(--oy);
}
@keyframes bx {
  to {
    transform: translateX(calc(100cqw - 2rem));
  }
}
@keyframes by {
  to {
    transform: translateY(calc(100cqh - 2rem));
  }
}
@media (prefers-reduced-motion: reduce) {
  .bx,
  .by {
    animation-play-state: paused;
  }
}
</style>
