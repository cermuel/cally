<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import type { CreateLinkPayload } from "~/utils/api/links";
import { normalizeLinkSlug } from "~/utils/links";

const props = defineProps<{
  username?: string | null;
  submitting: boolean;
  errors?: Record<string, string[]>;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  cancel: [];
  submit: [payload: CreateLinkPayload];
}>();

const name = ref("");
const slug = ref("");
const description = ref("");
const duration = ref("30");
const color = ref<string | null>(null);
const publishImmediately = ref(true);
const localErrors = ref<Record<string, string>>({});

watch(slug, (value) => {
  const normalized = normalizeLinkSlug(value);
  if (value !== normalized) slug.value = normalized;
});

const fieldError = (field: string) =>
  localErrors.value[field] || props.errors?.[field]?.[0];

const submit = () => {
  localErrors.value = {};

  if (name.value.trim().length < 4 || name.value.trim().length > 20) {
    localErrors.value.name = "Use between 4 and 20 characters.";
  }
  if (slug.value.length < 3) {
    localErrors.value.slug = "Use at least 3 characters.";
  }
  if (
    !Number.isInteger(Number(duration.value)) ||
    Number(duration.value) <= 0
  ) {
    localErrors.value.duration_minutes = "Choose a valid duration.";
  }
  if (Object.keys(localErrors.value).length > 0) return;

  emit("submit", {
    name: name.value.trim(),
    slug: slug.value,
    description: description.value.trim() || null,
    color: color.value,
    duration_minutes: Number(duration.value),
    status: publishImmediately.value ? "published" : "draft",
    visibility: "public",
  });
};

const cancel = () => {
  open.value = false;
  emit("cancel");
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-120 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <div class="p-6 py-4 pb-0">
          <DialogTitle class="font-semibold text-lg"
            >Create a booking link</DialogTitle
          >
          <DialogDescription class="mt-1 text-sm text-muted-foreground">
            Set the essentials now. You can fine-tune the link later.
          </DialogDescription>
        </div>
        <form
          class="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"
          @submit.prevent="submit"
        >
          <div class="col-span-2">
            <SharedLabel for="link-name" class="mb-1.5 text-sm"
              >Name</SharedLabel
            >
            <SharedInput
              id="link-name"
              v-model="name"
              autocomplete="off"
              placeholder="30 Minute Meeting"
              maxlength="20"
              :error="fieldError('name')"
            />
          </div>

          <div class="col-span-2">
            <SharedLabel for="link-duration" class="mb-1.5 text-sm"
              >Duration</SharedLabel
            >
            <SharedSelect v-model="duration">
              <SharedSelectTrigger
                id="link-duration"
                class="w-full"
                :aria-invalid="Boolean(fieldError('duration_minutes'))"
              >
                <SharedSelectValue placeholder="Select duration" />
              </SharedSelectTrigger>
              <SharedSelectContent>
                <SharedSelectItem
                  v-for="minutes in [15, 30, 45, 60, 90]"
                  :key="minutes"
                  :value="String(minutes)"
                >
                  {{ minutes }} minutes
                </SharedSelectItem>
              </SharedSelectContent>
            </SharedSelect>
            <p
              v-if="fieldError('duration_minutes')"
              class="mt-1.5 text-xs text-destructive"
            >
              {{ fieldError("duration_minutes") }}
            </p>
          </div>

          <div class="sm:col-span-2">
            <SharedLabel for="link-slug" class="mb-1.5 text-sm"
              >Link</SharedLabel
            >
            <SharedInput
              id="link-slug"
              v-model="slug"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="30-minute-meeting"
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
            <UiLinksColorPicker v-model="color" />
          </div>

          <label
            class="flex cursor-pointer items-start gap-2 pt-2 sm:col-span-2"
          >
            <SharedCheckbox v-model="publishImmediately" class="mt-0.5" />

            <span class="block text-sm">Publish this link immediately</span>
          </label>

          <footer class="flex justify-end gap-2 sm:col-span-2">
            <SharedButton type="button" variant="outline" @click="cancel">
              Cancel
            </SharedButton>
            <SharedButton type="submit" :loading="submitting">
              Create link
            </SharedButton>
          </footer>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
