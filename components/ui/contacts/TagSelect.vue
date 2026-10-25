<script setup lang="ts">
import {
  ArrowLeft01Icon,
  ChevronDownIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  contactTags,
  getContactTagColor,
} from "~/constants/contact-tags";

const OTHER_TAG_VALUE = "__other_contact_tag__";

const props = withDefaults(
  defineProps<{
    id?: string;
    error?: string;
    contentClass?: string;
  }>(),
  {
    id: "contact-tag",
    error: undefined,
    contentClass: undefined,
  },
);

const tag = defineModel<string>({ default: "" });
const open = ref(false);
const customTagMode = ref(false);
const tagSelection = ref("");
const customTag = ref("");
const customTagInput = ref<{ focus: () => void } | null>(null);

const selectedTag = computed(() =>
  contactTags.find((option) => option.value === tag.value),
);
const tagColor = computed(() =>
  tagSelection.value
    ? getContactTagColor(tag.value || "Other")
    : undefined,
);
const isOtherSelected = computed(
  () => tagSelection.value === OTHER_TAG_VALUE,
);

watch(
  tag,
  (value) => {
    const preset = contactTags.find((option) => option.value === value);

    if (preset) {
      tagSelection.value = preset.value;
      customTag.value = "";
      return;
    }

    if (value) {
      tagSelection.value = OTHER_TAG_VALUE;
      customTag.value = value;
      return;
    }

    if (!isOtherSelected.value) {
      tagSelection.value = "";
      customTag.value = "";
    }
  },
  { immediate: true },
);

watch(open, (isOpen) => {
  if (isOpen && !tag.value) {
    tagSelection.value = "";
    customTag.value = "";
    return;
  }

  if (!isOpen) customTagMode.value = false;
});

watch(customTagMode, async (isEditing) => {
  if (!isEditing) return;

  await nextTick();
  customTagInput.value?.focus();
});

const selectPreset = (value: string) => {
  tagSelection.value = value;
  customTag.value = "";
  tag.value = value;
  open.value = false;
};

const selectOther = () => {
  tagSelection.value = OTHER_TAG_VALUE;
  tag.value = customTag.value;
  customTagMode.value = true;
};

const updateCustomTag = (value: string | number | undefined) => {
  customTag.value = String(value ?? "");
  tag.value = customTag.value;
};

const finishCustomTag = () => {
  open.value = false;
};

const clearTag = () => {
  open.value = false;
  customTagMode.value = false;
  tagSelection.value = "";
  customTag.value = "";
  tag.value = "";
};
</script>

<template>
  <div>
    <div class="mb-1.5 flex items-center justify-between gap-3">
      <SharedLabel :for="props.id" class="text-sm">Tag</SharedLabel>
      <button
        v-if="tagSelection"
        type="button"
        class="rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        @click="clearTag"
      >
        Clear
      </button>
    </div>

    <SharedPopover v-model:open="open">
      <SharedPopoverTrigger as-child>
        <SharedButton
          :id="props.id"
          type="button"
          variant="outline"
          class="w-full justify-between font-normal"
          :aria-invalid="Boolean(props.error)"
        >
          <span class="flex min-w-0 items-center gap-2">
            <span
              v-if="tagSelection"
              class="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
              :style="{ backgroundColor: tagColor }"
              aria-hidden="true"
            />
            <span
              class="truncate"
              :class="!tagSelection && 'text-muted-foreground'"
            >
              {{
                selectedTag?.label ||
                customTag ||
                (tagSelection ? "Other" : "Select a tag")
              }}
            </span>
          </span>
          <HugeiconsIcon
            :icon="ChevronDownIcon"
            :size="16"
            :stroke-width="1.75"
            class="text-muted-foreground"
            aria-hidden="true"
          />
        </SharedButton>
      </SharedPopoverTrigger>

      <SharedPopoverContent
        align="start"
        :class="[
          'w-(--reka-popover-trigger-width) min-w-56 p-1.5',
          props.contentClass,
        ]"
      >
        <div v-if="customTagMode" class="p-1.5">
          <button
            type="button"
            class="mb-3 flex items-center gap-1.5 rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            @click="customTagMode = false"
          >
            <HugeiconsIcon
              :icon="ArrowLeft01Icon"
              :size="14"
              :stroke-width="1.75"
              aria-hidden="true"
            />
            Back to tags
          </button>
          <SharedLabel :for="`${props.id}-custom`" class="mb-1.5 text-sm">
            Custom tag
          </SharedLabel>
          <SharedInput
            :id="`${props.id}-custom`"
            ref="customTagInput"
            :model-value="customTag"
            placeholder="Enter a tag"
            autocomplete="off"
            :error="props.error"
            @keydown.enter.prevent="finishCustomTag"
            @update:model-value="updateCustomTag"
          />
          <SharedButton
            type="button"
            size="sm"
            class="mt-3 w-full"
            @click="finishCustomTag"
          >
            Done
          </SharedButton>
        </div>

        <div v-else role="listbox" aria-label="Contact tags">
          <button
            v-for="option in contactTags"
            :key="option.value"
            type="button"
            role="option"
            class="flex min-h-9 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            :class="tagSelection === option.value && 'bg-accent'"
            :aria-selected="tagSelection === option.value"
            @click="selectPreset(option.value)"
          >
            <span
              class="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
              :style="{ backgroundColor: option.color }"
              aria-hidden="true"
            />
            {{ option.label }}
          </button>
          <button
            type="button"
            role="option"
            class="flex min-h-9 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            :class="isOtherSelected && 'bg-accent'"
            :aria-selected="isOtherSelected"
            @click="selectOther"
          >
            <span
              class="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
              :style="{ backgroundColor: getContactTagColor('Other') }"
              aria-hidden="true"
            />
            Other
          </button>
        </div>
      </SharedPopoverContent>
    </SharedPopover>

    <p v-if="props.error" class="mt-1.5 text-xs text-destructive">
      {{ props.error }}
    </p>
  </div>
</template>
