<script setup lang="ts">
import {
  BrowserIcon,
  Copy01Icon,
  CursorInWindowIcon,
  LinkSquare02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { toast } from "vue-sonner";

type EmbedType = "inline" | "popup";
type EmbedTheme = "auto" | "light" | "dark";

const embedTypeOptions = [
  { value: "inline" as const, label: "Inline", icon: BrowserIcon },
  { value: "popup" as const, label: "Popup", icon: CursorInWindowIcon },
];

const auth = useAuth();
const requestUrl = useRequestURL();
const username = computed(() => auth.user.value?.username ?? "");
const { data: eventsData, isPending: eventsPending } = usePublicEvents(username);

const embedType = ref<EmbedType>("inline");
const theme = ref<EmbedTheme>("auto");
const target = ref("profile");
const buttonLabel = ref("Book a meeting");
const buttonColor = ref("#171717");
const copied = ref(false);
let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

const siteOrigin = requestUrl.origin;
const buttonColorError = computed(() =>
  /^#[\da-f]{6}$/i.test(buttonColor.value)
    ? ""
    : "Use a six-digit hex color, such as #171717.",
);
const safeButtonColor = computed(() =>
  buttonColorError.value ? "#171717" : buttonColor.value,
);
const buttonTextColor = computed(() => {
  const channels = [1, 3, 5].map((index) => {
    const value =
      Number.parseInt(safeButtonColor.value.slice(index, index + 2), 16) / 255;
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
  const whiteContrast = 1.05 / (luminance + 0.05);
  const blackContrast = (luminance + 0.05) / 0.05;
  return whiteContrast >= blackContrast ? "#ffffff" : "#000000";
});
const selectedEvent = computed(() =>
  eventsData.value?.events.find((event) => String(event.id) === target.value),
);
const publicPath = computed(() => {
  const profilePath = "/" + encodeURIComponent(username.value);
  return selectedEvent.value
    ? profilePath + "/" + encodeURIComponent(selectedEvent.value.slug)
    : profilePath;
});
const publicUrl = computed(() => siteOrigin + publicPath.value);
const previewUrl = computed(() => {
  const url = new URL(publicUrl.value);
  url.searchParams.set("embed", "true");
  url.searchParams.set("theme", theme.value);
  url.searchParams.set("mode", embedType.value);
  return url.toString();
});
const publicUrlLabel = computed(() => publicUrl.value.replace(/^https?:\/\//, ""));
const safeButtonLabel = computed(() =>
  buttonLabel.value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;"),
);
const embedCode = computed(() => {
  const script =
    '<script async src="' + siteOrigin + '/embed.js"><' + '/script>';

  if (embedType.value === "popup") {
    return [
      "<button",
      '  type="button"',
      '  data-cally-embed="popup"',
      '  data-cally-url="' + publicUrl.value + '"',
      '  data-cally-theme="' + theme.value + '"',
      '  style="border:0;border-radius:8px;background:' +
        safeButtonColor.value +
        ";color:" +
        buttonTextColor.value +
        ';padding:10px 16px;font:500 14px/20px system-ui;cursor:pointer"',
      ">" + (safeButtonLabel.value || "Book a meeting") + "</button>",
      script,
    ].join("\n");
  }

  return [
    "<div",
    '  data-cally-embed="inline"',
    '  data-cally-url="' + publicUrl.value + '"',
    '  data-cally-theme="' + theme.value + '"',
    "></div>",
    script,
  ].join("\n");
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(embedCode.value);
    copied.value = true;
    toast.success("Embed code copied");
    if (copiedTimeout) clearTimeout(copiedTimeout);
    copiedTimeout = setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch {
    toast.error("Could not copy the embed code.");
  }
};

onBeforeUnmount(() => {
  if (copiedTimeout) clearTimeout(copiedTimeout);
});
</script>

<template>
  <section class="space-y-5" aria-labelledby="embed-settings-heading">
    <header>
      <h2
        id="embed-settings-heading"
        class="text-xl font-semibold tracking-tight text-balance"
      >
        Embed your booking page
      </h2>
      <p class="mt-1 max-w-2xl text-sm leading-6 text-pretty text-muted-foreground">
        Configure a polished booking experience, preview it, then paste one
        snippet into your site.
      </p>
    </header>

    <div
      class="overflow-hidden rounded-xl border border-border bg-card shadow-xs"
    >
      <div class="grid lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside
          class="space-y-6 border-b border-border p-4 sm:p-5 lg:border-e lg:border-b-0"
          aria-label="Embed configuration"
        >
          <section class="space-y-2.5">
            <h3
              class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              Format
            </h3>
            <div class="grid grid-cols-2 rounded-lg bg-muted p-1">
              <button
                v-for="option in embedTypeOptions"
                :key="option.value"
                type="button"
                class="flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none transition-[background-color,box-shadow,color,transform] duration-150 active:scale-96 focus-visible:ring-2 focus-visible:ring-ring/60"
                :class="
                  embedType === option.value
                    ? 'bg-background text-foreground shadow-xs'
                    : 'hover:text-foreground'
                "
                :aria-pressed="embedType === option.value"
                @click="embedType = option.value"
              >
                <HugeiconsIcon
                  :icon="option.icon"
                  :size="16"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
                {{ option.label }}
              </button>
            </div>
            <p class="text-xs leading-5 text-muted-foreground">
              {{
                embedType === "inline"
                  ? "Lives directly inside your page and follows its width."
                  : "Opens in a focused modal from a button on your site."
              }}
            </p>
          </section>

          <section class="space-y-4">
            <h3
              class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              Content
            </h3>
            <div class="space-y-1.5">
              <SharedLabel for="embed-target" class="text-xs">
                Booking page
              </SharedLabel>
              <SharedSelect v-model="target" :loading="eventsPending">
                <SharedSelectTrigger id="embed-target" class="w-full">
                  <SharedSelectValue placeholder="Choose a page" />
                </SharedSelectTrigger>
                <SharedSelectContent>
                  <SharedSelectItem value="profile">
                    Full public profile
                  </SharedSelectItem>
                  <SharedSelectItem
                    v-for="event in eventsData?.events ?? []"
                    :key="event.id"
                    :value="String(event.id)"
                  >
                    {{ event.name }}
                  </SharedSelectItem>
                </SharedSelectContent>
              </SharedSelect>
            </div>

            <div class="space-y-1.5">
              <SharedLabel for="embed-theme" class="text-xs">
                Appearance
              </SharedLabel>
              <SharedSelect v-model="theme">
                <SharedSelectTrigger id="embed-theme" class="w-full">
                  <SharedSelectValue />
                </SharedSelectTrigger>
                <SharedSelectContent>
                  <SharedSelectItem value="auto">
                    Match visitor’s device
                  </SharedSelectItem>
                  <SharedSelectItem value="light">Light</SharedSelectItem>
                  <SharedSelectItem value="dark">Dark</SharedSelectItem>
                </SharedSelectContent>
              </SharedSelect>
            </div>
          </section>

          <section v-if="embedType === 'popup'" class="space-y-4">
            <h3
              class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              Trigger
            </h3>
            <div class="space-y-1.5">
              <SharedLabel for="embed-button-label" class="text-xs">
                Button label
              </SharedLabel>
              <SharedInput
                id="embed-button-label"
                v-model="buttonLabel"
                maxlength="40"
                placeholder="Book a meeting"
              />
            </div>

            <div class="space-y-1.5">
              <SharedLabel for="embed-button-color" class="text-xs">
                Button color
              </SharedLabel>
              <div class="flex items-start gap-2">
                <label
                  class="relative grid size-9 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-md border border-input bg-background shadow-xs focus-within:ring-2 focus-within:ring-ring/60"
                  :style="{ backgroundColor: safeButtonColor }"
                >
                  <span class="sr-only">Choose button color</span>
                  <input
                    id="embed-button-color"
                    type="color"
                    :value="safeButtonColor"
                    class="absolute inset-0 size-full cursor-pointer opacity-0"
                    @input="
                      buttonColor = ($event.target as HTMLInputElement).value
                    "
                  />
                </label>
                <SharedInput
                  v-model="buttonColor"
                  aria-label="Button color hex value"
                  :error="buttonColorError"
                  maxlength="7"
                  spellcheck="false"
                  class="font-mono uppercase"
                />
              </div>
            </div>
          </section>
        </aside>

        <section class="min-w-0 bg-muted/15" aria-labelledby="embed-preview-heading">
          <header
            class="flex min-h-12 items-center justify-between gap-3 border-b border-border px-4"
          >
            <div class="min-w-0">
              <h3 id="embed-preview-heading" class="text-sm font-medium">
                Preview
              </h3>
            </div>
            <a
              :href="publicUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <span class="max-w-48 truncate">{{ publicUrlLabel }}</span>
              <HugeiconsIcon
                :icon="LinkSquare02Icon"
                :size="14"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </a>
          </header>

          <UiSettingsEmbedPreview
            :button-color="safeButtonColor"
            :button-label="buttonLabel || 'Book a meeting'"
            :button-text-color="buttonTextColor"
            :embed-type="embedType"
            :src="previewUrl"
          />
        </section>
      </div>

      <section class="border-t border-border" aria-labelledby="embed-code-heading">
        <header
          class="flex min-h-14 flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
        >
          <div>
            <h3 id="embed-code-heading" class="text-sm font-medium">
              Installation
            </h3>
            <p class="mt-0.5 text-xs text-muted-foreground">
              Paste this where the booking experience should appear.
            </p>
          </div>
          <SharedButton
            type="button"
            size="sm"
            variant="outline"
            @click="copyCode"
          >
            <span class="relative size-4" aria-hidden="true">
              <HugeiconsIcon
                :icon="Copy01Icon"
                :size="16"
                :stroke-width="1.75"
                class="absolute inset-0 transition-[filter,opacity,transform] duration-150"
                :class="
                  copied
                    ? 'scale-25 opacity-0 blur-xs'
                    : 'scale-100 opacity-100 blur-0'
                "
              />
              <HugeiconsIcon
                :icon="Tick02Icon"
                :size="16"
                :stroke-width="1.75"
                class="absolute inset-0 transition-[filter,opacity,transform] duration-150"
                :class="
                  copied
                    ? 'scale-100 opacity-100 blur-0'
                    : 'scale-25 opacity-0 blur-xs'
                "
              />
            </span>
            {{ copied ? "Copied" : "Copy code" }}
          </SharedButton>
        </header>
        <pre
          class="max-h-56 overflow-auto border-t border-border bg-muted/25 px-4 py-3 text-xs leading-5 whitespace-pre-wrap text-foreground/80 sm:px-5"
        ><code>{{ embedCode }}</code></pre>
      </section>
    </div>
  </section>
</template>
