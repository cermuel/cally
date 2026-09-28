<script setup lang="ts">
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Link, UpdateLinkPayload } from "~/utils/api/links";

const props = defineProps<{
  link: Link;
  username?: string | null;
  saving?: boolean;
  errors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
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

const fieldError = (field: string) => props.errors?.[field]?.[0];

const changedPayload = computed<UpdateLinkPayload>(() => {
  const payload: UpdateLinkPayload = {};
  const values = {
    name: name.value.trim(),
    slug: slug.value.trim(),
    duration_minutes: Number(duration.value),
    description: description.value.trim() || null,
    color: color.value,
    status: published.value ? "published" as const : "draft" as const,
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
    class="rounded-xl border border-border bg-card shadow-xs"
    @submit.prevent="save"
  >
    <header class="border-b border-border px-5 py-4 sm:px-6">
      <h2 class="font-semibold">Link details</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Review the settings for this booking link.
      </p>
    </header>

    <div class="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
      <div>
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
      <div>
        <SharedLabel for="detail-link-duration" class="mb-1.5 text-sm"
          >Duration</SharedLabel
        >
        <SharedInput
          id="detail-link-duration"
          v-model="duration"
          type="number"
          :disabled="saving"
          :error="fieldError('duration_minutes')"
        >
          <template #suffix><span class="text-xs">minutes</span></template>
        </SharedInput>
      </div>
      <div class="sm:col-span-2">
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
              class="flex h-full select-none items-center border-r border-border bg-muted px-3 text-sm text-muted-foreground"
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
      <div class="sm:col-span-2">
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
        class="flex items-start gap-3 rounded-lg border border-border p-4 sm:col-span-2"
      >
        <SharedCheckbox
          v-model="published"
          class="mt-0.5"
          :disabled="saving"
        />
        <span>
          <span class="block text-sm font-medium">Published</span>
          <span class="mt-0.5 block text-sm text-muted-foreground"
            >This link is
            {{ published ? "published" : "saved as a draft" }}.</span
          >
        </span>
      </label>
      <div
        v-if="localError"
        role="alert"
        class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive sm:col-span-2"
      >
        {{ localError }}
      </div>
      <div
        v-if="errors?.slug?.[0] || errors?.name?.[0]"
        role="alert"
        class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive sm:col-span-2"
      >
        {{ errors?.slug?.[0] || errors?.name?.[0] }}
      </div>
      <div
        class="flex items-start gap-2 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground sm:col-span-2"
      >
        <HugeiconsIcon
          :icon="InformationCircleIcon"
          :size="17"
          :stroke-width="1.75"
          class="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p>
          Changes update this link for your account and invalidate the cached
          sidebar list.
        </p>
      </div>
      <footer class="flex justify-end sm:col-span-2">
        <SharedButton
          type="submit"
          :disabled="!hasChanges"
          :loading="saving"
          >Save changes</SharedButton
        >
      </footer>
    </div>
  </form>
</template>
