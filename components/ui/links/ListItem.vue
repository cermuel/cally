<script setup lang="ts">
import type { LinkListView } from "~/types/links";
import type { Link } from "~/utils/api/links";

const props = withDefaults(
  defineProps<{
    link: Link;
    publicLabel: string;
    publicUrl: string;
    updating?: boolean;
    view?: LinkListView;
  }>(),
  { view: "ticket" },
);

const emit = defineEmits<{
  delete: [link: Link];
  duplicate: [link: Link];
  open: [link: Link];
  visibility: [link: Link, visibility: Link["visibility"]];
}>();

const isPublic = computed(() => props.link.visibility === "public");
const isTicket = computed(() => props.view === "ticket");

const switchVars = computed(() =>
  props.link.color ? { "--primary": props.link.color } : undefined,
);

const root = ref<HTMLElement>();

type Snap = { r: DOMRect; parts: Map<string, DOMRect> };

const snap = (): Snap | null => {
  const el = root.value;
  if (!el) return null;
  const parts = new Map<string, DOMRect>();
  el.querySelectorAll<HTMLElement>("[data-flip]").forEach((p) =>
    parts.set(p.dataset.flip!, p.getBoundingClientRect()),
  );
  return { r: el.getBoundingClientRect(), parts };
};

watch(
  () => props.view,
  async () => {
    const before = snap();
    await nextTick();
    const el = root.value;
    if (!el || !before) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const after = snap()!;
    const opts: KeyframeAnimationOptions = {
      duration: 340,
      easing: "cubic-bezier(0.32, 0.72, 0, 1)",
    };

    el.animate(
      [
        {
          transform: `translateY(${before.r.top - after.r.top}px)`,
          height: `${before.r.height}px`,
        },
        { transform: "none", height: `${after.r.height}px` },
      ],
      opts,
    );

    el.querySelectorAll<HTMLElement>("[data-flip]").forEach((p) => {
      const key = p.dataset.flip!;
      const o = before.parts.get(key);
      const n = after.parts.get(key);
      if (!o || !n) return;

      const dx = o.left - before.r.left - (n.left - after.r.left);
      const dy = o.top - before.r.top - (n.top - after.r.top);
      const from: Keyframe = { transform: `translate(${dx}px, ${dy}px)` };
      const to: Keyframe = { transform: "none" };

      if (key === "swatch") {
        Object.assign(from, {
          width: `${o.width}px`,
          height: `${o.height}px`,
          borderRadius: isTicket.value ? "50%" : "0px",
        });
        Object.assign(to, {
          width: `${n.width}px`,
          height: `${n.height}px`,
          borderRadius: isTicket.value ? "0px" : "50%",
        });
      }
      p.animate([from, to], opts);
    });
  },
  { flush: "sync" },
);
</script>

<template>
  <article
    ref="root"
    class="group relative grid items-center overflow-hidden transition-[background-color,border-radius] duration-300"
    :class="
      isTicket
        ? 'grid-cols-[6rem_minmax(0,1fr)_auto] grid-rows-[auto_auto] min-h-24 rounded-2xl bg-muted dark:bg-card sm:grid-cols-[7rem_minmax(0,1fr)_auto]'
        : 'grid-cols-[1.25rem_minmax(0,1fr)_auto] gap-x-4 rounded-xl bg-transparent px-3 py-3 max-sm:dark:bg-muted/50 max-sm:bg-muted dark:hover:bg-muted/50 hover:bg-muted md:grid-cols-[1.25rem_minmax(0,1.2fr)_minmax(0,1.5fr)_6rem_auto]'
    "
  >
    <button
      type="button"
      class="absolute inset-0 z-0 rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      :aria-label="`Edit ${link.name}`"
      @click="emit('open', link)"
    />

    <div
      data-flip="swatch"
      aria-hidden="true"
      class="pointer-events-none"
      :class="[
        !link.color && (isTicket ? 'bg-muted' : 'bg-foreground/20'),
        isTicket
          ? 'col-start-1 row-span-2 row-start-1 h-full self-stretch border-r-2 border-dashed ' +
            (link.color ? 'dark:border-black/25' : 'border-border')
          : 'col-start-1 row-start-1 size-5 rounded-full',
      ]"
      :style="link.color ? { backgroundColor: link.color } : undefined"
    />

    <div
      data-flip="name"
      class="pointer-events-none flex min-w-0 items-center gap-2"
      :class="
        isTicket
          ? 'col-start-2 row-start-1 self-end px-4 pt-4 sm:px-5'
          : 'col-start-2 row-start-1'
      "
    >
      <h2
        class="truncate font-semibold"
        :class="isTicket ? 'text-sm sm:text-base' : 'text-sm'"
      >
        {{ link.name }}
      </h2>
      <span
        v-if="link.status === 'draft'"
        class="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
        >Draft</span
      >
    </div>

    <p
      data-flip="url"
      class="pointer-events-none truncate text-sm text-muted-foreground"
      :class="
        isTicket
          ? 'col-start-2 row-start-2 self-start px-4 pb-4 sm:px-5'
          : 'col-start-3 row-start-1 hidden md:block'
      "
    >
      {{ publicLabel }}
    </p>

    <p
      data-flip="duration"
      class="pointer-events-none whitespace-nowrap"
      :class="
        isTicket
          ? [
              'col-start-1 row-span-2 row-start-1 flex flex-col items-center justify-center leading-none',
              link.color ? 'text-black' : 'text-foreground',
            ]
          : 'col-start-4 row-start-1 hidden text-sm text-muted-foreground md:block'
      "
    >
      <span
        :class="
          isTicket ? 'text-3xl font-extrabold tracking-tight sm:text-4xl' : ''
        "
        >{{ link.duration_minutes }}</span
      >
      <span :class="isTicket ? 'text-xs font-medium opacity-70' : ''">
        {{ isTicket ? "min" : " min" }}
      </span>
    </p>

    <div
      data-flip="controls"
      class="relative z-10 flex items-center justify-end gap-2"
      :class="
        isTicket
          ? 'col-start-3 row-span-2 row-start-1 pr-3 sm:pr-4'
          : 'col-start-3 row-start-1 md:col-start-5'
      "
      :style="switchVars"
    >
      <SharedSwitch
        :model-value="isPublic"
        :disabled="updating"
        :aria-label="`${link.name} is ${link.visibility}. Toggle visibility.`"
        @update:model-value="
          emit('visibility', link, $event ? 'public' : 'private')
        "
      />
      <UiLinksActions
        :link="link"
        :public-url="publicUrl"
        @delete="emit('delete', $event)"
        @duplicate="emit('duplicate', $event)"
      />
    </div>
  </article>
</template>
