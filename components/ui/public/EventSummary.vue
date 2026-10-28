<script setup lang="ts">
import { Clock01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import PublicRichText from "./RichText.vue";

const props = defineProps<{
  hostName: string;
  hostImage?: string;
  title: string;
  description?: string;
  durationLabel: string;
  loading?: boolean;
  hideDescriptionOnMobile?: boolean;
}>();

const expanded = ref(false);
const descriptionElement = ref<HTMLElement | null>(null);
const descriptionOverflows = ref(false);

const measureDescription = async () => {
  await nextTick();

  if (
    !descriptionElement.value ||
    !window.matchMedia("(max-width: 767px)").matches
  ) {
    descriptionOverflows.value = false;
    return;
  }

  descriptionOverflows.value =
    descriptionElement.value.scrollHeight >
    descriptionElement.value.clientHeight + 1;
};

const handleResize = () => void measureDescription();

watch(
  () => [props.description, props.hideDescriptionOnMobile],
  () => {
    expanded.value = false;
    void measureDescription();
  },
  { flush: "post" },
);

onMounted(() => {
  void measureDescription();
  void document.fonts.ready.then(measureDescription);
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => window.removeEventListener("resize", handleResize));
</script>

<template>
  <aside
    class="flex flex-col gap-4 max-sm:h-max sm:flex-row sm:items-center sm:justify-between sm:gap-6"
  >
    <div
      v-if="loading"
      class="w-full space-y-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:space-y-0"
      aria-busy="true"
    >
      <div class="flex items-center gap-2">
        <span
          class="size-8 rounded-full bg-muted motion-safe:animate-pulse"
        />
        <span class="h-4 w-24 rounded bg-muted motion-safe:animate-pulse" />
      </div>
      <div
        class="block h-7 w-3/4 rounded bg-muted motion-safe:animate-pulse sm:w-40"
      />
      <div
        class="mb-0 block h-4 w-1/2 rounded bg-muted motion-safe:animate-pulse sm:w-40"
      />
    </div>

    <template v-else>
      <div class="flex shrink-0 items-center gap-2">
        <UiPublicProfileAvatar :image="hostImage" :name="hostName" size="sm" />
        <p class="text-sm font-medium text-muted-foreground">{{ hostName }}</p>
      </div>

      <h1
        class="min-w-0 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:flex-1 sm:text-center"
      >
        {{ title }}
      </h1>

      <dl
        class="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-foreground/85 sm:shrink-0 sm:flex-nowrap"
      >
        <div class="flex items-center gap-2">
          <dt class="grid size-5 place-items-center text-muted-foreground">
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
        <div class="flex items-center gap-2">
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
      </dl>

      <div
        v-if="description"
        class="min-h-0 md:hidden md:flex-1 md:flex-col hidden"
        :class="hideDescriptionOnMobile ? 'max-md:hidden' : ''"
      >
        <div
          id="event-description"
          ref="descriptionElement"
          class="min-h-0 md:flex-1 md:overflow-y-auto md:pe-1"
          :class="!expanded ? 'max-md:max-h-12.5 max-md:overflow-hidden' : ''"
        >
          <PublicRichText :html="description" />
        </div>
        <button
          v-if="descriptionOverflows"
          type="button"
          :aria-expanded="expanded"
          aria-controls="event-description"
          class="mt-1 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground md:hidden"
          @click="expanded = !expanded"
        >
          {{ expanded ? "Show less" : "Show more" }}
        </button>
      </div>
    </template>
  </aside>
</template>
