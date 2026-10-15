<script setup lang="ts">
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { teamsApi } from "~/utils/api/teams";

const props = defineProps<{
  teamId: number;
  description: string | null;
  editable: boolean;
}>();

const client = useApiClient();
const queryClient = useQueryClient();

const draft = ref(props.description ?? "");
const focused = ref(false);
const saved = ref(false);
let timer: ReturnType<typeof setTimeout>;
const updateMutation = useMutation({
  mutationFn: (description: string | null) =>
    teamsApi.update(client, props.teamId, { description }),
  onSuccess: async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(props.teamId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() }),
    ]);
    toast.success("Team description updated");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not update the team description.")),
});
const saving = computed(() => updateMutation.isPending.value);

const serialize = (html: string) => (html === "<p></p>" ? "" : html);
const normalizedDraft = computed(() => draft.value.trim());
const hasChanges = computed(
  () => normalizedDraft.value !== (props.description ?? "").trim(),
);
const showActions = computed(
  () => props.editable && (focused.value || hasChanges.value),
);

function save() {
  if (!hasChanges.value || saving.value) return;
  updateMutation.mutate(normalizedDraft.value || null);
}

function cancel() {
  if (saving.value) return;
  draft.value = props.description ?? "";
  editor.value?.commands.setContent(draft.value, { emitUpdate: false });
  editor.value?.commands.blur();
}

const editor = useEditor({
  content: draft.value,
  editable: props.editable && !saving.value,
  extensions: [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      underline: false,
      link: false,
    }),
    Placeholder.configure({
      placeholder: props.editable ? "Add a description…" : "",
    }),
  ],
  editorProps: {
    attributes: {
      class: "min-h-18 text-sm leading-6 text-muted-foreground outline-none",
      "aria-label": "Team description",
    },
    handleKeyDown: (_view, event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
        return true;
      }
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        save();
        return true;
      }
      return false;
    },
  },
  onFocus: () => (focused.value = true),
  onBlur: () => (focused.value = false),
  onUpdate: ({ editor: e }) => {
    draft.value = serialize(e.getHTML());
  },
});

watch(
  () => props.description,
  (description) => {
    draft.value = description ?? "";
    const e = editor.value;
    if (e && draft.value !== serialize(e.getHTML())) {
      e.commands.setContent(draft.value, { emitUpdate: false });
    }
  },
);

watch(
  () => [props.editable, saving.value] as const,
  ([editable, saving]) => editor.value?.setEditable(editable && !saving),
);

watch(
  saving,
  async (saving, wasSaving) => {
    if (!wasSaving || saving) return;
    await nextTick();
    if (hasChanges.value) return;
    editor.value?.commands.blur();
    saved.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (saved.value = false), 1500);
  },
);

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div v-if="editable || description" class="mt-2 max-w-3xl">
    <div
      class="relative -ms-3 rounded-md border border-border/60 bg-transparent px-3 pt-2 transition-colors focus-within:border-ring/50"
      :class="[editable ? 'pb-11 hover:border-border' : 'pb-2']"
    >
      <EditorContent
        v-if="editor"
        :editor="editor"
        class="team-description max-h-56 overflow-y-auto overscroll-contain"
      />
      <div v-else class="min-h-18" aria-hidden="true" />

      <Transition
        enter-active-class="transition duration-150"
        leave-active-class="transition duration-100"
        enter-from-class="translate-y-1 opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showActions" class="absolute inset-e-2 bottom-2 flex gap-1">
          <SharedButton
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Cancel editing team description"
            title="Cancel (Esc)"
            :disabled="saving"
            @mousedown.prevent
            @click="cancel"
          >
            <HugeiconsIcon
              :icon="Cancel01Icon"
              :size="16"
              :stroke-width="2"
              aria-hidden="true"
            />
          </SharedButton>
          <SharedButton
            type="button"
            size="icon-xs"
            aria-label="Save team description"
            title="Save (⌘/Ctrl + Enter)"
            :disabled="!hasChanges"
            :loading="saving"
            @mousedown.prevent
            @click="save"
          >
            <HugeiconsIcon
              :icon="Tick02Icon"
              :size="16"
              :stroke-width="2"
              aria-hidden="true"
            />
          </SharedButton>
        </div>
      </Transition>

      <Transition
        enter-active-class="transition duration-150"
        leave-active-class="transition duration-300"
        enter-from-class="scale-75 opacity-0"
        leave-to-class="opacity-0"
      >
        <HugeiconsIcon
          v-if="saved && !showActions"
          :icon="Tick02Icon"
          :size="14"
          :stroke-width="2.5"
          class="pointer-events-none absolute inset-e-3 bottom-4 text-emerald-500"
          aria-hidden="true"
        />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.team-description :deep(.tiptap p + p) {
  margin-top: 0.5rem;
}

.team-description :deep(.tiptap ul) {
  list-style: disc;
  padding-inline-start: 1.25rem;
}

.team-description :deep(.tiptap ol) {
  list-style: decimal;
  padding-inline-start: 1.25rem;
}

.team-description :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--muted-foreground);
  opacity: 0.6;
}
</style>
