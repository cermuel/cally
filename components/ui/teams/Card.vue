<script setup lang="ts">
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Team } from "~/utils/api/teams";

const props = defineProps<{ team: Team }>();

const MAX = 3;
const CARD_DELAY = 1000;
const CARD_W = 184;
const CARD_H = 50;
const GAP = 6;
const D = 32;
const MAX_FLING = 1400;
const SPRING = 260;
const DAMPING = 24;
const DRAG_WEIGHT = 0.2;

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

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  ts: number;
  cruise: number;
  hover: boolean;
  drag: boolean;
  gx: number;
  gy: number;
};

const panel = ref<HTMLElement>();
const ready = ref(false);
const hover = reactive({ i: 0, x: 0, y: 0, open: false });
const els: HTMLElement[] = [];
let balls: Ball[] = [];
let W = 0;
let H = 0;
let frame = 0;
let last = 0;
let moved = false;
let blockClick = false;
let startX = 0;
let startY = 0;
let ro: ResizeObserver | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), Math.max(min, max));

const init = () => {
  if (!panel.value) return;
  W = panel.value.clientWidth;
  H = panel.value.clientHeight;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  balls = shown.value.map((_, i) => {
    const r = rng(hash(`${seed.value}-${i}`));
    const cruise = reduced ? 0 : 150 + r() * 90;
    const a = r() * Math.PI * 2;
    const x = r() * (W - D);
    const y = r() * (H - D);
    return {
      x,
      y,
      vx: Math.cos(a) * cruise,
      vy: Math.sin(a) * cruise,
      tx: x,
      ty: y,
      ts: 1,
      cruise,
      hover: false,
      drag: false,
      gx: 0,
      gy: 0,
    };
  });
  ready.value = true;
};

const weight = (b: Ball) => (b.drag ? DRAG_WEIGHT : b.hover ? 0 : 1);
const effVx = (b: Ball) => (b.drag ? b.vx : b.vx * b.ts);
const effVy = (b: Ball) => (b.drag ? b.vy : b.vy * b.ts);

const tick = (t: number) => {
  const dt = Math.min((t - last) / 1000, 0.032);
  last = t;

  for (const b of balls) {
    const held = b.hover || b.drag;
    b.ts += ((held ? 0 : 1) - b.ts) * Math.min(1, dt * 8);

    if (b.drag) {
      b.vx += ((b.tx - b.x) * SPRING - b.vx * DAMPING) * dt;
      b.vy += ((b.ty - b.y) * SPRING - b.vy * DAMPING) * dt;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > MAX_FLING) {
        b.vx = (b.vx / sp) * MAX_FLING;
        b.vy = (b.vy / sp) * MAX_FLING;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    } else {
      if (!held) {
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 0.01) {
          const ns = sp + (b.cruise - sp) * Math.min(1, dt * 1.2);
          b.vx *= ns / sp;
          b.vy *= ns / sp;
        } else if (b.cruise) {
          const a = Math.random() * Math.PI * 2;
          b.vx = Math.cos(a) * b.cruise;
          b.vy = Math.sin(a) * b.cruise;
        }
      }
      b.x += b.vx * b.ts * dt;
      b.y += b.vy * b.ts * dt;
    }

    if (b.x < 0) {
      b.x = 0;
      b.vx = b.drag ? Math.max(b.vx, 0) : Math.abs(b.vx);
    }
    if (b.x > W - D) {
      b.x = W - D;
      b.vx = b.drag ? Math.min(b.vx, 0) : -Math.abs(b.vx);
    }
    if (b.y < 0) {
      b.y = 0;
      b.vy = b.drag ? Math.max(b.vy, 0) : Math.abs(b.vy);
    }
    if (b.y > H - D) {
      b.y = H - D;
      b.vy = b.drag ? Math.min(b.vy, 0) : -Math.abs(b.vy);
    }
  }

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= D || dist === 0) continue;
      const wa = weight(a);
      const wb = weight(b);
      if (wa + wb === 0) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = D - dist;
      a.x -= (nx * overlap * wa) / (wa + wb);
      a.y -= (ny * overlap * wa) / (wa + wb);
      b.x += (nx * overlap * wb) / (wa + wb);
      b.y += (ny * overlap * wb) / (wa + wb);
      const rv = (effVx(b) - effVx(a)) * nx + (effVy(b) - effVy(a)) * ny;
      if (rv < 0) {
        const imp = (-2 * rv) / (wa + wb);
        a.vx -= imp * wa * nx;
        a.vy -= imp * wa * ny;
        b.vx += imp * wb * nx;
        b.vy += imp * wb * ny;
      }
    }
  }

  balls.forEach((b, i) => {
    const el = els[i];
    if (el) el.style.transform = `translate3d(${b.x}px,${b.y}px,0)`;
  });
  frame = requestAnimationFrame(tick);
};

const place = (b: Ball) => {
  const below = H - (b.y + D);
  const toBottom = below >= CARD_H + GAP || below >= b.y;
  const y = toBottom ? b.y + D + GAP : b.y - CARD_H - GAP;

  const centered = b.x + D / 2 - CARD_W / 2;
  let x = centered;
  if (centered < GAP) x = b.x;
  else if (centered + CARD_W > W - GAP) x = b.x + D - CARD_W;

  hover.x = clamp(x, GAP, W - CARD_W - GAP);
  hover.y = clamp(y, GAP, H - CARD_H - GAP);
};

const scheduleCard = (i: number) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const b = balls[i];
    if (!b || b.drag || !b.hover) return;
    hover.i = i;
    place(b);
    hover.open = true;
  }, CARD_DELAY);
};

const enter = (i: number) => {
  const b = balls[i];
  if (!b) return;
  b.hover = true;
  scheduleCard(i);
};

const leave = (i: number) => {
  const b = balls[i];
  if (!b || b.drag) return;
  b.hover = false;
  clearTimeout(timer);
  hover.open = false;
};

const down = (e: PointerEvent, i: number) => {
  const b = balls[i];
  const el = els[i];
  if (!b || !el || !panel.value) return;
  const p = panel.value.getBoundingClientRect();
  el.setPointerCapture(e.pointerId);
  el.style.zIndex = "5";
  b.drag = true;
  b.hover = true;
  b.gx = e.clientX - p.left - b.x;
  b.gy = e.clientY - p.top - b.y;
  b.tx = b.x;
  b.ty = b.y;
  moved = false;
  startX = e.clientX;
  startY = e.clientY;
  clearTimeout(timer);
  hover.open = false;
};

const move = (e: PointerEvent, i: number) => {
  const b = balls[i];
  if (!b?.drag || !panel.value) return;
  const p = panel.value.getBoundingClientRect();
  b.tx = clamp(e.clientX - p.left - b.gx, 0, W - D);
  b.ty = clamp(e.clientY - p.top - b.gy, 0, H - D);
  if (Math.hypot(e.clientX - startX, e.clientY - startY) > 4) moved = true;
};

const up = (e: PointerEvent, i: number) => {
  const b = balls[i];
  const el = els[i];
  if (!b?.drag || !panel.value) return;
  b.drag = false;
  if (el) el.style.zIndex = "";
  if (moved) {
    blockClick = true;
    setTimeout(() => (blockClick = false), 150);
  }
  const p = panel.value.getBoundingClientRect();
  const over =
    Math.hypot(
      e.clientX - p.left - (b.x + D / 2),
      e.clientY - p.top - (b.y + D / 2),
    ) <=
    D / 2;
  const sp = Math.hypot(b.vx, b.vy);
  if (sp > 200 || !over) b.hover = false;
  if (b.hover) scheduleCard(i);
};

const onLinkClick = (e: MouseEvent) => {
  if (!blockClick) return;
  e.preventDefault();
  e.stopPropagation();
};

onMounted(() => {
  init();
  last = performance.now();
  frame = requestAnimationFrame(tick);
  if (panel.value) {
    ro = new ResizeObserver(() => {
      if (!panel.value) return;
      W = panel.value.clientWidth;
      H = panel.value.clientHeight;
      balls.forEach((b) => {
        b.x = clamp(b.x, 0, W - D);
        b.y = clamp(b.y, 0, H - D);
      });
    });
    ro.observe(panel.value);
  }
});

watch(() => shown.value.length, init);

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  clearTimeout(timer);
  ro?.disconnect();
});
</script>

<template>
  <NuxtLink
    :to="`/app/teams/${team.slug}`"
    class="group flex flex-col rounded-2xl border border-border bg-card p-2 outline-none transition-colors"
    @click.capture="onLinkClick"
    @dragstart.prevent
  >
    <div
      ref="panel"
      class="relative h-44 overflow-hidden rounded-xl bg-muted dark:bg-black"
    >
      <div
        v-for="(m, i) in shown"
        :key="i"
        :ref="(el) => (els[i] = el as HTMLElement)"
        class="absolute left-0 top-0 cursor-grab touch-none select-none active:cursor-grabbing"
        :class="ready ? '' : 'opacity-0'"
        @pointerenter="enter(i)"
        @pointerleave="leave(i)"
        @pointerdown.prevent="down($event, i)"
        @pointermove="move($event, i)"
        @pointerup="up($event, i)"
        @pointercancel="up($event, i)"
        @dragstart.prevent
        @click.prevent.stop
      >
        <SharedAvatar
          :name="memberName(m, i)"
          :image="memberImage(m)"
          class="size-8 border-2 border-muted dark:border-black"
        />
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
        class="pointer-events-none absolute bottom-3 right-3 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
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
