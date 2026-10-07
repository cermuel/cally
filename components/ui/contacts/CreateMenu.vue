<script setup lang="ts">
import {
  Add01Icon,
  ArrowLeft02Icon,
  Cancel01Icon,
  Download01Icon,
  FileImportIcon,
  PlusSignIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const props = defineProps<{
  uploading?: boolean;
  downloading?: boolean;
}>();

const open = ref(false);
const view = ref<"menu" | "import">("menu");
const fileInput = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

const emit = defineEmits<{
  "add-single": [];
  import: [file: File];
  template: [];
}>();

watch(open, (isOpen) => {
  if (!isOpen) view.value = "menu";
});

const addSingleContact = () => {
  open.value = false;
  emit("add-single");
};

const openFilePicker = () => fileInput.value?.click();

const handleFile = (file: File | undefined) => {
  if (!file) return;
  open.value = false;
  emit("import", file);
};

const selectFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  handleFile(input.files?.[0]);
  input.value = "";
};

const dropFile = (event: DragEvent) => {
  dragging.value = false;
  handleFile(event.dataTransfer?.files[0]);
};

const downloadTemplate = () => {
  open.value = false;
  emit("template");
};
</script>

<template>
  <SharedPopover v-model:open="open">
    <SharedPopoverTrigger as-child>
      <SharedButton
        type="button"
        :loading="props.uploading || props.downloading"
        :disabled="props.uploading || props.downloading"
      >
        <HugeiconsIcon
          :icon="PlusSignIcon"
          :size="16"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        Add contact
      </SharedButton>
    </SharedPopoverTrigger>

    <SharedPopoverContent
      align="end"
      class="p-1.5"
      :class="view === 'import' ? 'w-80 max-w-[calc(100vw-2rem)]' : 'w-48'"
    >
      <template v-if="view === 'menu'">
        <button
          type="button"
          class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          @click="addSingleContact"
        >
          <HugeiconsIcon :icon="Add01Icon" :size="16" :stroke-width="1.5" aria-hidden="true" />
          Add single contact
        </button>
        <button
          type="button"
          class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          @click="view = 'import'"
        >
          <HugeiconsIcon :icon="FileImportIcon" :size="16" :stroke-width="1.5" aria-hidden="true" />
          Import contacts
        </button>
        <button
          type="button"
          class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          @click="downloadTemplate"
        >
          <HugeiconsIcon :icon="Download01Icon" :size="16" :stroke-width="1.5" aria-hidden="true" />
          Download template
        </button>
      </template>

      <template v-else>
        <div class="flex items-start justify-between gap-3 px-1 py-1">
          <button
            type="button"
            class="rounded-md p-1 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to contact actions"
            @click="view = 'menu'"
          >
            <HugeiconsIcon :icon="ArrowLeft02Icon" :size="16" :stroke-width="1.75" aria-hidden="true" />
          </button>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">Import contacts</p>
            <p class="mt-1 text-xs text-muted-foreground">Upload a file to add multiple contacts.</p>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close import contacts"
            @click="open = false"
          >
            <HugeiconsIcon :icon="Cancel01Icon" :size="16" :stroke-width="1.75" aria-hidden="true" />
          </button>
        </div>

        <input
          ref="fileInput"
          class="sr-only"
          type="file"
          accept=".csv,.txt,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          @change="selectFile"
        />
        <button
          type="button"
          class="mt-3 flex w-full flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          :class="dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent'"
          @click="openFilePicker"
          @dragover.prevent="dragging = true"
          @dragenter.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="dropFile"
        >
          <HugeiconsIcon :icon="Upload01Icon" :size="20" :stroke-width="1.5" class="text-muted-foreground" aria-hidden="true" />
          <span class="mt-2 text-sm font-medium">Drop your file here</span>
          <span class="mt-1 text-xs text-muted-foreground">or click to browse · max 10 MB</span>
        </button>
        <p class="mt-3 text-center text-xs text-muted-foreground">CSV, TXT, XLSX, or XLS</p>
      </template>
    </SharedPopoverContent>
  </SharedPopover>
</template>
