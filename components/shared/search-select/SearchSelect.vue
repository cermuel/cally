<script setup lang="ts" generic="TItem = SearchSelectItem">
import {
  CheckIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from "reka-ui";
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
  type PropType,
  shallowRef,
  useAttrs,
  watch,
} from "vue";
import { cn } from "../../../lib/utils";
import type {
  SearchSelectContent,
  SearchSelectItem,
  SearchSelectSearch,
  SearchSelectValue,
} from "../../../types/components/shared/search-select";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    contentClass?: HTMLAttributes["class"];
    debounce?: number;
    disabled?: boolean;
    empty?: SearchSelectContent;
    getItemLabel?: (item: TItem) => SearchSelectContent;
    getItemRightSection?: (item: TItem) => SearchSelectContent | undefined;
    getItemText?: (item: TItem) => string;
    getItemValue?: (item: TItem) => SearchSelectValue;
    isItemDisabled?: (item: TItem) => boolean;
    items?: readonly TItem[];
    loading?: boolean;
    placeholder?: string;
    search?: SearchSelectSearch<TItem>;
    searchPlaceholder?: string;
  }>(),
  {
    debounce: 250,
    disabled: false,
    empty: "No results found.",
    items: () => [],
    loading: false,
    placeholder: "Select an option",
    search: undefined,
    searchPlaceholder: "Search...",
  },
);

const emit = defineEmits<{
  searchError: [error: unknown];
}>();

const model = defineModel<SearchSelectValue>();
const open = defineModel<boolean>("open", { default: false });
const attrs = useAttrs();
const query = shallowRef("");
const results = shallowRef<readonly TItem[]>(props.items);
const selectedItemCache = shallowRef<TItem>();
const searching = shallowRef(false);

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let requestId = 0;

const RenderContent = defineComponent({
  props: {
    content: {
      type: null as unknown as PropType<SearchSelectContent>,
      required: true,
    },
  },
  setup(renderProps) {
    return () =>
      typeof renderProps.content === "function"
        ? renderProps.content()
        : renderProps.content;
  },
});

const itemValue = (item: TItem) =>
  props.getItemValue?.(item) ?? (item as SearchSelectItem).value;

const itemLabel = (item: TItem) =>
  props.getItemLabel?.(item) ?? (item as SearchSelectItem).label;

const itemText = (item: TItem) =>
  props.getItemText?.(item) ?? (item as SearchSelectItem).textValue;

const itemRightSection = (item: TItem) =>
  props.getItemRightSection?.(item) ??
  (item as SearchSelectItem).rightSection;

const itemDisabled = (item: TItem) =>
  props.isItemDisabled?.(item) ??
  (item as SearchSelectItem).disabled ??
  false;

const visibleItems = computed(() => {
  const normalizedQuery = query.value.trim().toLocaleLowerCase();
  const items = props.search ? results.value : props.items;

  if (!normalizedQuery) return items;

  return items.filter((item) =>
    itemText(item).toLocaleLowerCase().includes(normalizedQuery),
  );
});

const pending = computed(() => props.loading || searching.value);

const selectedItem = computed(() =>
  visibleItems.value.find((item) => Object.is(itemValue(item), model.value)) ??
  props.items.find((item) => Object.is(itemValue(item), model.value)) ??
  selectedItemCache.value,
);

const rememberSelectedItem = (items: readonly TItem[]) => {
  const item = items.find((candidate) =>
    Object.is(itemValue(candidate), model.value),
  );

  if (item) selectedItemCache.value = item;
};

const runSearch = async (searchQuery: string) => {
  if (!props.search) return;

  const currentRequest = ++requestId;
  searching.value = true;

  try {
    const items = await props.search(searchQuery);
    if (currentRequest !== requestId) return;

    results.value = items;
    rememberSelectedItem(items);
  } catch (error) {
    if (currentRequest !== requestId) return;

    results.value = [];
    emit("searchError", error);
  } finally {
    if (currentRequest === requestId) searching.value = false;
  }
};

const scheduleSearch = (searchQuery: string) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    void runSearch(searchQuery);
  }, props.debounce);
};

const handleOpenChange = async (isOpen: boolean) => {
  open.value = isOpen;

  if (isOpen) {
    await nextTick();
    if (props.search) void runSearch(query.value);
    return;
  }

  requestId += 1;
  if (debounceTimer) clearTimeout(debounceTimer);
  searching.value = false;
  query.value = "";
  results.value = props.items;
};

const handleSelection = (value: SearchSelectValue) => {
  model.value = value;
  rememberSelectedItem(visibleItems.value);
  query.value = "";
};

watch(query, (value) => {
  if (!open.value || !props.search) return;

  requestId += 1;
  searching.value = true;
  scheduleSearch(value);
});

watch(
  () => props.items,
  (items) => {
    rememberSelectedItem(items);
    if (!props.search || !open.value) results.value = items;
  },
  { immediate: true },
);

watch(model, () => {
  rememberSelectedItem(visibleItems.value);
});

onBeforeUnmount(() => {
  requestId += 1;
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
  <ComboboxRoot
    :model-value="model"
    :open="open"
    :disabled="disabled"
    :ignore-filter="true"
    :reset-search-term-on-select="false"
    @update:model-value="handleSelection"
    @update:open="handleOpenChange"
  >
    <ComboboxAnchor as-child>
      <ComboboxTrigger
        v-bind="attrs"
        data-slot="search-select-trigger"
        :aria-busy="loading ? 'true' : undefined"
        :class="
          cn(
            'border-input data-placeholder:text-muted-foreground [&_svg:not([class*=text-])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 flex h-9 w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50',
            props.class,
          )
        "
      >
        <span class="flex min-w-0 flex-1 items-center gap-2 text-start">
          <slot v-if="selectedItem" name="value" :item="selectedItem">
            <RenderContent :content="itemLabel(selectedItem)" />
          </slot>
          <slot v-else name="placeholder">
            <span class="truncate text-muted-foreground">
              {{ placeholder }}
            </span>
          </slot>
        </span>
        <HugeiconsIcon
          :icon="loading ? LoaderCircleIcon : ChevronDownIcon"
          :size="16"
          color="currentColor"
          :stroke-width="1.75"
          :class="loading ? 'animate-spin' : 'opacity-50'"
          aria-hidden="true"
        />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        position="popper"
        align="start"
        :side-offset="4"
        :class="
          cn(
            'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-96 min-w-(--reka-combobox-trigger-width) origin-(--reka-combobox-content-transform-origin) overflow-hidden rounded-md border shadow-md',
            props.contentClass,
          )
        "
      >
        <div class="relative border-b p-1">
          <HugeiconsIcon
            :icon="Search01Icon"
            :size="16"
            color="currentColor"
            :stroke-width="1.75"
            class="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <ComboboxInput
            v-model="query"
            auto-focus
            :placeholder="searchPlaceholder"
            class="h-8 w-full rounded-sm bg-transparent ps-8 pe-8 text-sm outline-none placeholder:text-muted-foreground focus:bg-accent/50"
          />
          <HugeiconsIcon
            v-if="pending"
            :icon="LoaderCircleIcon"
            :size="16"
            color="currentColor"
            :stroke-width="1.75"
            class="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-label="Searching"
          />
        </div>

        <ComboboxViewport class="max-h-72 space-y-1 p-1">
          <ComboboxItem
            v-for="item in visibleItems"
            :key="`${typeof itemValue(item)}:${String(itemValue(item))}`"
            :value="itemValue(item)"
            :text-value="itemText(item)"
            :disabled="itemDisabled(item)"
            class="focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground relative flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50"
          >
            <slot
              name="item"
              :item="item"
              :selected="Object.is(itemValue(item), model)"
            >
              <span class="min-w-0 flex-1 truncate">
                <RenderContent :content="itemLabel(item)" />
              </span>
              <span class="ms-auto flex shrink-0 items-center gap-2">
                <slot name="right-section" :item="item">
                  <RenderContent
                    v-if="itemRightSection(item) !== undefined"
                    :content="itemRightSection(item)!"
                  />
                </slot>
                <HugeiconsIcon
                  v-if="Object.is(itemValue(item), model)"
                  :icon="CheckIcon"
                  :size="16"
                  color="currentColor"
                  :stroke-width="2"
                  aria-hidden="true"
                />
              </span>
            </slot>
          </ComboboxItem>

          <div
            v-if="!pending && visibleItems.length === 0"
            class="px-2 py-6 text-center text-sm text-muted-foreground"
          >
            <slot name="empty" :query="query">
              <RenderContent :content="empty" />
            </slot>
          </div>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
