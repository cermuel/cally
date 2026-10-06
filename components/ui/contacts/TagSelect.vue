<script setup lang="ts">
import {
  contactTags,
  getContactTagColor,
} from "~/constants/contact-tags";

const OTHER_TAG_VALUE = "__other_contact_tag__";

const props = withDefaults(
  defineProps<{
    id?: string;
    error?: string;
  }>(),
  {
    id: "contact-tag",
    error: undefined,
  },
);

const tag = defineModel<string>({ default: "" });
const tagSelection = ref("");
const customTag = ref("");

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

const selectTag = (value: string) => {
  tagSelection.value = value;

  if (value === OTHER_TAG_VALUE) {
    tag.value = customTag.value;
    return;
  }

  customTag.value = "";
  tag.value = value;
};

const updateCustomTag = (value: string | number | undefined) => {
  customTag.value = String(value ?? "");
  tag.value = customTag.value;
};

const clearTag = () => {
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
    <SharedSelect
      :model-value="tagSelection"
      @update:model-value="selectTag"
    >
      <SharedSelectTrigger
        :id="props.id"
        class="w-full"
        :aria-invalid="Boolean(props.error)"
      >
        <SharedSelectValue placeholder="Select a tag">
          <template v-if="tagSelection">
            <span
              class="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
              :style="{ backgroundColor: tagColor }"
              aria-hidden="true"
            />
            <span>{{ selectedTag?.label || customTag || "Other" }}</span>
          </template>
        </SharedSelectValue>
      </SharedSelectTrigger>
      <SharedSelectContent>
        <SharedSelectItem
          v-for="option in contactTags"
          :key="option.value"
          :value="option.value"
          :text-value="option.label"
        >
          <span class="flex items-center gap-2">
            <span
              class="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
              :style="{ backgroundColor: option.color }"
              aria-hidden="true"
            />
            {{ option.label }}
          </span>
        </SharedSelectItem>
        <SharedSelectItem
          :value="OTHER_TAG_VALUE"
          text-value="Other"
        >
          <span class="flex items-center gap-2">
            <span
              class="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
              :style="{ backgroundColor: getContactTagColor('Other') }"
              aria-hidden="true"
            />
            Other
          </span>
        </SharedSelectItem>
      </SharedSelectContent>
    </SharedSelect>
    <div v-if="isOtherSelected" class="mt-3">
      <SharedLabel :for="`${props.id}-custom`" class="mb-1.5 text-sm">
        Custom tag
      </SharedLabel>
      <SharedInput
        :id="`${props.id}-custom`"
        :model-value="customTag"
        placeholder="Enter a tag"
        autocomplete="off"
        :error="props.error"
        @update:model-value="updateCustomTag"
      />
    </div>
    <p
      v-else-if="props.error"
      class="mt-1.5 text-xs text-destructive"
    >
      {{ props.error }}
    </p>
  </div>
</template>
