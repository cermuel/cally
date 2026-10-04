<script setup lang="ts">
import {
  Delete02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Link, UpdateLinkPayload } from "~/utils/api/links";

const props = withDefaults(
  defineProps<{
    link: Link;
    username?: string | null;
    saving?: boolean;
    deleting?: boolean;
    errors?: Record<string, string[]>;
    sheet?: boolean;
  }>(),
  { deleting: false, saving: false, sheet: false },
);

const emit = defineEmits<{
  delete: [link: Link];
  save: [payload: UpdateLinkPayload];
}>();

const name = ref(props.link.name);
const slug = ref(props.link.slug);
const duration = ref(String(props.link.duration_minutes));
const description = ref(props.link.description ?? "");
const color = ref(props.link.color);
const published = ref(props.link.status === "published");
const visibility = ref(props.link.visibility);
const localError = ref("");

const resetForm = (link: Link) => {
  name.value = link.name;
  slug.value = link.slug;
  duration.value = String(link.duration_minutes);
  description.value = link.description ?? "";
  color.value = link.color;
  published.value = link.status === "published";
  visibility.value = link.visibility;
  localError.value = "";
};

watch(() => props.link, resetForm);

const fieldError = (field: string) => props.errors?.[field]?.[0];

const changedPayload = computed<UpdateLinkPayload>(() => {
  const payload: UpdateLinkPayload = {};
  const values = {
    name: name.value.trim(),
    slug: slug.value.trim(),
    duration_minutes: Number(duration.value),
    description: description.value.trim() || null,
    color: color.value,
    status: published.value ? ("published" as const) : ("draft" as const),
    visibility: visibility.value,
  };

  for (const key of Object.keys(values) as Array<keyof typeof values>) {
    if (values[key] !== props.link[key]) {
      Object.assign(payload, { [key]: values[key] });
    }
  }

  return payload;
});

const hasChanges = computed(() => Object.keys(changedPayload.value).length > 0);

const save = () => {
  localError.value = "";
  const trimmedName = name.value.trim();
  const numericDuration = Number(duration.value);

  if (trimmedName.length < 4 || trimmedName.length > 20) {
    localError.value = "Name must be between 4 and 20 characters.";
    return;
  }
  if (!slug.value.trim() || slug.value.trim().length < 3) {
    localError.value = "Slug must be at least 3 characters.";
    return;
  }
  if (!Number.isInteger(numericDuration) || numericDuration <= 0) {
    localError.value = "Duration must be a positive whole number.";
    return;
  }

  if (!hasChanges.value) return;

  emit("save", changedPayload.value);
};
</script>

<template>
  <form
    :class="
      sheet
        ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
        : 'min-w-0 rounded-xl border border-border bg-card shadow-xs'
    "
    @submit.prevent="save"
  >
    <header v-if="!sheet" class="border-b border-border px-5 py-4 sm:px-6">
      <h2 class="font-semibold">Link details</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Review the settings for this booking link.
      </p>
    </header>

    <div
      class="grid min-w-0 grid-cols-1 gap-4"
      :class="
        sheet
          ? 'min-h-0 flex-1 overscroll-contain overflow-y-auto px-5 py-4'
          : 'p-5 pb-0 sm:p-4 sm:pb-0'
      "
    >
      <div class="min-w-0">
        <SharedLabel for="detail-link-name" class="mb-1.5 text-sm"
          >Name</SharedLabel
        >
        <SharedInput
          id="detail-link-name"
          v-model="name"
          :disabled="saving"
          :error="fieldError('name')"
        />
      </div>
      <UiLinksDurationSelect
        v-model="duration"
        id="detail-link-duration"
        :disabled="saving"
        :error="fieldError('duration_minutes')"
      />
      <div class="min-w-0">
        <SharedLabel for="detail-link-slug" class="mb-1.5 text-sm"
          >Link</SharedLabel
        >
        <SharedInput
          id="detail-link-slug"
          v-model="slug"
          :disabled="saving"
          :error="fieldError('slug')"
        >
          <template #prefix>
            <span
              class="flex h-full min-w-0 select-none items-center truncate border-r border-border bg-muted px-3 text-sm text-muted-foreground"
            >
              cally.cermuel.dev/{{ username || "username" }}/
            </span>
          </template>
        </SharedInput>
      </div>
      <div>
        <SharedLabel class="mb-1.5 text-sm">Color</SharedLabel>
        <UiLinksColorPicker v-model="color" :disabled="saving" />
      </div>
      <div>
        <SharedLabel class="mb-1.5 text-sm">Visibility</SharedLabel>
        <SharedSelect v-model="visibility" :disabled="saving">
          <SharedSelectTrigger class="w-full capitalize"
            ><SharedSelectValue
          /></SharedSelectTrigger>
          <SharedSelectContent>
            <SharedSelectItem value="public">Public</SharedSelectItem>
            <SharedSelectItem value="private">Private</SharedSelectItem>
          </SharedSelectContent>
        </SharedSelect>
      </div>
      <div class="">
        <SharedLabel for="detail-link-description" class="mb-1.5 text-sm"
          >Description</SharedLabel
        >
        <SharedTextarea
          id="detail-link-description"
          v-model="description"
          :rows="3"
          :disabled="saving"
          :error="fieldError('description')"
        />
      </div>
      <label
        class="flex items-start gap-3 rounded-lg border border-border p-4 h-max"
      >
        <SharedCheckbox v-model="published" class="mt-0.5" :disabled="saving" />
        <span class="block text-sm font-medium">Published</span>
      </label>
      <div
        v-if="localError"
        role="alert"
        class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive"
      >
        {{ localError }}
      </div>
      <div
        v-if="errors?.slug?.[0] || errors?.name?.[0]"
        role="alert"
        class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive"
      >
        {{ errors?.slug?.[0] || errors?.name?.[0] }}
      </div>
    </div>

    <footer
      class="flex shrink-0 gap-2"
      :class="
        sheet
          ? 'border-t border-border bg-background/50 p-4 md:px-6'
          : 'justify-end px-5 py-5 sm:px-6 sm:py-6'
      "
    >
      <SharedButton
        type="submit"
        :class="sheet && 'flex-1'"
        :disabled="!hasChanges || deleting"
        :loading="saving"
      >
        Save changes
      </SharedButton>
      <SharedButton
        v-if="sheet"
        type="button"
        variant="outline"
        size="icon"
        class="text-destructive hover:bg-destructive/10 hover:text-destructive"
        :disabled="saving || deleting"
        aria-label="Delete link"
        @click="emit('delete', link)"
      >
        <HugeiconsIcon
          :icon="Delete02Icon"
          :size="17"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </SharedButton>
    </footer>
  </form>
</template>
