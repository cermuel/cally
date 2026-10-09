<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import type { CreateTeamPayload } from "~/utils/api/teams";

const props = defineProps<{
  saving: boolean;
  errors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
  create: [payload: CreateTeamPayload];
}>();

const open = defineModel<boolean>("open", { default: false });
const name = ref("");
const slug = ref("");
const description = ref("");
const slugEdited = ref(false);
const localErrors = ref<Record<string, string>>({});

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const fieldError = (field: string) =>
  localErrors.value[field] || props.errors?.[field]?.[0];

const reset = () => {
  name.value = "";
  slug.value = "";
  description.value = "";
  slugEdited.value = false;
  localErrors.value = {};
};

watch(open, (isOpen) => {
  if (isOpen) reset();
});

const updateName = (value: string | number) => {
  name.value = String(value);
  localErrors.value.name = "";
  if (!slugEdited.value) slug.value = normalizeSlug(name.value);
};

const updateSlug = (value: string | number) => {
  slugEdited.value = true;
  slug.value = normalizeSlug(String(value));
  localErrors.value.slug = "";
};

const submit = () => {
  localErrors.value = {};

  if (!name.value.trim()) localErrors.value.name = "Enter a team name.";
  if (!slug.value) localErrors.value.slug = "Enter a team slug.";
  if (Object.keys(localErrors.value).length) return;

  emit("create", {
    name: name.value.trim(),
    slug: slug.value,
    description: description.value || null,
  });
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <header class="flex items-start gap-4 border-b border-border px-6 py-5">
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-lg font-semibold">Create a team</DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted-foreground">
              Give your team a name and a place to call home.
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <SharedButton
              variant="ghost"
              size="icon-sm"
              class="-me-2 -mt-1"
              aria-label="Close create team dialog"
            >
              <HugeiconsIcon
                :icon="Cancel01Icon"
                :size="18"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </SharedButton>
          </DialogClose>
        </header>

        <div class="min-h-0 space-y-5 overflow-y-auto p-6">
          <div>
            <SharedLabel for="team-name" class="mb-1.5 text-sm">
              Team name
            </SharedLabel>
            <SharedInput
              id="team-name"
              :model-value="name"
              autocomplete="organization"
              placeholder="Product team"
              :error="fieldError('name')"
              @update:model-value="updateName"
              @keydown.enter="submit"
            />
          </div>

          <div>
            <SharedLabel for="team-slug" class="mb-1.5 text-sm">
              Team link
            </SharedLabel>
            <SharedInput
              id="team-slug"
              :model-value="slug"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="product-team"
              :error="fieldError('slug')"
              @update:model-value="updateSlug"
              @keydown.enter="submit"
            >
              <template #prefix>
                <span
                  class="flex h-full select-none items-center border-e border-border bg-muted ps-3.5 pe-2.5 text-sm text-muted-foreground"
                >
                  cally.cermuel.dev/teams/
                </span>
              </template>
            </SharedInput>
          </div>

          <div>
            <SharedLabel class="mb-1.5 text-sm">Description</SharedLabel>
            <UiProfileRichTextEditor
              v-model="description"
              aria-label="Team description"
              placeholder="What does your team work on?"
              :error="fieldError('description')"
            />
          </div>
        </div>

        <footer class="flex justify-end gap-2 border-t border-border px-6 py-4">
          <DialogClose as-child>
            <SharedButton variant="outline" :disabled="saving">
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton :loading="saving" @click="submit">
            Create team
          </SharedButton>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
