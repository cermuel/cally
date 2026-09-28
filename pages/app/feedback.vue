<script setup lang="ts">
import {
  Cancel01Icon,
  Comment01Icon,
  FilePlusCornerIcon,
  SendIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { nextTick, onMounted, ref } from "vue";
import { toast } from "vue-sonner";
import { acceptedFileTypes } from "~/constants/feedback";

export type AttachmentKind = "image" | "pdf" | "word";

export type FeedbackAttachment = {
  file: File;
  id: string;
  kind: AttachmentKind;
};

type TextareaField = {
  focus: () => void;
};

const emit = defineEmits<{
  submit: [message: string, files: File[]];
}>();

const message = ref("");
const attachments = ref<FeedbackAttachment[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const textarea = ref<TextareaField | null>(null);
const breadcrumb = useBreadcrumb();

breadcrumb.setItems([{ title: "Leave feedback", icon: Comment01Icon }]);

const selectFiles = () => {
  fileInput.value?.click();
};

const handleFiles = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const selectedFiles = Array.from(input.files ?? []);
  const rejectedFiles: string[] = [];

  for (const file of selectedFiles) {
    const kind = feedbackHelpers.attachmentKindOf(file);

    if (!kind) {
      rejectedFiles.push(file.name);
      continue;
    }

    attachments.value.push({
      file,
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      kind,
    });
  }

  if (rejectedFiles.length > 0) {
    toast.error("Only images, PDFs, and Word documents can be attached.", {
      description: rejectedFiles.join(", "),
    });
  }

  input.value = "";
};

const removeAttachment = (id: string) => {
  attachments.value = attachments.value.filter(
    (attachment) => attachment.id !== id,
  );
};

const submitFeedback = () => {
  const trimmedMessage = message.value.trim();

  if (!trimmedMessage) {
    return;
  }

  emit(
    "submit",
    trimmedMessage,
    attachments.value.map((attachment) => attachment.file),
  );
};

onMounted(async () => {
  await nextTick();
  textarea.value?.focus();
});

definePageMeta({ layout: false });
useHead({ title: "Feedback | Cally" });
</script>

<template>
  <UiAppShell>
    <div class="flex h-full w-full flex-col items-center justify-start">
      <div
        class="p-1 bg-muted dark:bg-muted/30 w-full max-w-180 overflow-hidden rounded-2xl"
      >
        <div
          v-if="attachments.length > 0"
          class="flex gap-2 overflow-x-auto px-1 pb-1"
          aria-label="Attached files"
        >
          <div
            v-for="attachment in attachments"
            :key="attachment.id"
            class="flex h-8 max-w-40 shrink-0 items-center gap-1 rounded-[10px] bg-white dark:bg-muted/40 p-2 pr-0.5"
          >
            <div class="shrink-0">
              <HugeiconsIcon
                :icon="feedbackHelpers.iconFor(attachment.kind)"
                :size="18"
                :stroke-width="1.75"
                :class="feedbackHelpers.iconClassFor(attachment.kind)"
                aria-hidden="true"
              />
            </div>
            <span class="min-w-0 truncate text-[13px] font-medium">
              {{ attachment.file.name }}
            </span>
            <SharedButton
              variant="ghost"
              size="icon-sm"
              class="h-6 w-6 dark:hover:bg-background!"
              :aria-label="`Remove ${attachment.file.name}`"
              @click="removeAttachment(attachment.id)"
            >
              <HugeiconsIcon
                :icon="Cancel01Icon"
                :size="15"
                :stroke-width="2"
                aria-hidden="true"
              />
            </SharedButton>
          </div>
        </div>
        <form
          class="w-full overflow-hidden rounded-2xl bg-white/90 dark:bg-muted/50"
          @submit.prevent="submitFeedback"
        >
          <SharedTextarea
            ref="textarea"
            v-model="message"
            :rows="6"
            class="rounded-[10px]! overflow-hidden border-none! bg-transparent! p-5 shadow-none! outline-0! ring-0 focus:outline-0! focus:ring-0!"
            placeholder="Leave feedback or report a problem"
            aria-label="Feedback message"
          />

          <div class="flex items-center p-3 pt-0">
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              :accept="acceptedFileTypes"
              multiple
              @change="handleFiles"
            />
            <SharedButton
              variant="ghost"
              size="icon-sm"
              aria-label="Attach images, PDFs, or Word documents"
              @click="selectFiles"
            >
              <HugeiconsIcon
                :icon="FilePlusCornerIcon"
                :size="17"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </SharedButton>
            <SharedButton
              type="submit"
              size="icon-sm"
              class="ml-auto transition-[color,background-color,opacity,scale] active:scale-[0.96]"
              :disabled="message.trim().length === 0"
              aria-label="Send feedback"
            >
              <HugeiconsIcon
                :icon="SendIcon"
                :size="17"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </SharedButton>
          </div>
        </form>
      </div></div
  ></UiAppShell>
</template>
