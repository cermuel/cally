<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { toast } from "vue-sonner";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import {
  linksApi,
  type CreateLinkPayload,
  type Link,
} from "~/utils/api/links";
import { queryKeys } from "~/utils/api/query-keys";
import { normalizeLinkSlug } from "~/utils/links";

const props = defineProps<{
  nested?: boolean;
  purpose?: "event" | "link";
  username?: string | null;
}>();

const emit = defineEmits<{
  created: [link: Link];
}>();

const open = defineModel<boolean>("open", { default: false });

const client = useApiClient();
const queryClient = useQueryClient();

const name = ref("");
const slug = ref("");
const description = ref("");
const duration = ref("30");
const color = ref<string | null>(null);
const publishImmediately = ref(true);
const localErrors = ref<Record<string, string>>({});
const apiErrors = ref<Record<string, string[]>>({});

watch(open, (isOpen) => {
  if (!isOpen) return;

  name.value = "";
  slug.value = "";
  description.value = "";
  duration.value = "30";
  color.value = null;
  publishImmediately.value = true;
  localErrors.value = {};
  apiErrors.value = {};
});

watch(slug, (value) => {
  const normalized = normalizeLinkSlug(value);
  if (value !== normalized) slug.value = normalized;
});

const fieldError = (field: string) =>
  localErrors.value[field] || apiErrors.value[field]?.[0];

const createMutation = useMutation({
  mutationFn: (payload: CreateLinkPayload) => linksApi.create(client, payload),
  onSuccess: async (response) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.links.all() });
    apiErrors.value = {};
    open.value = false;
    emit("created", response.link);
    toast.success(props.purpose === "event" ? "Event created" : "Link created");
  },
  onError: (error) => {
    apiErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not create the link."));
  },
});

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

  createMutation.mutate({
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
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        :class="nested ? 'z-70' : 'z-50'"
      />
      <DialogContent
        class="fixed inset-s-1/2 top-1/2 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-120 -translate-x-1/2 -translate-y-1/2 overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-card shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        :class="nested ? 'z-70' : 'z-50'"
      >
        <div class="p-6 py-4 pb-0">
          <DialogTitle class="text-lg font-semibold">
            {{ purpose === "event" ? "Create an event" : "Create a booking link" }}
          </DialogTitle>
          <DialogDescription class="mt-1 text-sm text-muted-foreground">
            {{
              purpose === "event"
                ? "Set up the meeting type now. You can fine-tune it later."
                : "Set the essentials now. You can fine-tune the link later."
            }}
          </DialogDescription>
        </div>
        <div
          class="grid min-w-0 grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6"
        >
          <div class="min-w-0 sm:col-span-2">
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

          <UiLinksDurationSelect
            v-model="duration"
            id="link-duration"
            class="sm:col-span-2"
            :error="fieldError('duration_minutes')"
          />

          <div class="min-w-0 sm:col-span-2">
            <SharedLabel for="link-description" class="mb-1.5 text-sm">
              Description
              <span class="text-muted-foreground">(optional)</span>
            </SharedLabel>
            <SharedTextarea
              id="link-description"
              v-model="description"
              :rows="3"
              placeholder="Describe what this meeting is for"
              :error="fieldError('description')"
            />
          </div>

          <div class="min-w-0 sm:col-span-2">
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
                  class="flex h-full min-w-0 select-none items-center truncate border-r border-border bg-muted px-3 text-sm text-muted-foreground"
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
            <SharedButton
              type="button"
              :loading="createMutation.isPending.value"
              @click="submit"
            >
              {{ purpose === "event" ? "Create event" : "Create link" }}
            </SharedButton>
          </footer>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
