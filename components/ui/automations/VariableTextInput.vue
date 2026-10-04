<script setup lang="ts">
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { VariableToken, variableDocument } from "~/utils/variable-token";

const props = withDefaults(
  defineProps<{
    variables: string[];
    disabled?: boolean;
    error?: string;
    placeholder?: string;
  }>(),
  { disabled: false, placeholder: "" },
);

const model = defineModel<string>({ default: "" });
const container = ref<HTMLElement | null>(null);
const listboxId = `automation-variable-input-${useId()}`;
const errorId = `automation-variable-input-error-${useId()}`;
const variableQuery = ref("");
const variableRange = ref<{ from: number; to: number } | null>(null);
const menuPosition = ref<{ top: number; left: number } | null>(null);

const filteredVariables = computed(() => {
  if (!variableRange.value) return [];
  const query = variableQuery.value.toLowerCase();
  return props.variables.filter((variable) =>
    variable.toLowerCase().includes(query),
  );
});

const updateSuggestions = () => {
  const currentEditor = editor.value;
  if (!currentEditor) return;

  const { $from } = currentEditor.state.selection;
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, "\n", "\0");
  const match = textBefore.match(/\{\{([a-z_]*)$/i);

  variableQuery.value = match?.[1] ?? "";
  variableRange.value = match
    ? { from: $from.pos - match[0].length, to: $from.pos }
    : null;

  if (!match || !container.value) {
    menuPosition.value = null;
    return;
  }

  const caret = currentEditor.view.coordsAtPos($from.pos);
  const bounds = container.value.getBoundingClientRect();
  const menuWidth = Math.min(256, bounds.width - 16);
  menuPosition.value = {
    top: caret.bottom - bounds.top + 4,
    left: Math.max(
      0,
      Math.min(caret.left - bounds.left, bounds.width - menuWidth),
    ),
  };
};

const insertVariable = (variable: string) => {
  const currentEditor = editor.value;
  if (!currentEditor) return;

  const chain = currentEditor.chain().focus();
  if (variableRange.value) chain.deleteRange(variableRange.value);
  chain
    .insertContent({ type: "variableToken", attrs: { value: variable } })
    .run();

  variableRange.value = null;
  variableQuery.value = "";
  menuPosition.value = null;
};

const closeSuggestions = () => {
  variableRange.value = null;
  variableQuery.value = "";
  menuPosition.value = null;
};

const {
  activeIndex,
  handleKeydown: handleSuggestionKeydown,
  setActiveIndex,
} = useVariableSuggestionNavigation(
  filteredVariables,
  insertVariable,
  closeSuggestions,
);

const editor = useEditor({
  content: variableDocument(model.value),
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      code: false,
      codeBlock: false,
      hardBreak: false,
      horizontalRule: false,
      strike: false,
      link: false,
    }),
    VariableToken,
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  editorProps: {
    attributes: {
      class:
        "min-h-9 overflow-x-auto whitespace-nowrap px-3 py-2 text-base leading-5 outline-none md:text-sm",
      role: "textbox",
      "aria-label": "Email subject",
      "aria-autocomplete": "list",
      "aria-expanded": "false",
      "aria-invalid": props.error ? "true" : "false",
    },
    handleKeyDown: (_view, event) => {
      if (handleSuggestionKeydown(event)) return true;
      if (event.key === "Enter") {
        event.preventDefault();
        return true;
      }
      return false;
    },
  },
  onUpdate: ({ editor }) => {
    model.value = editor.getText();
    updateSuggestions();
  },
  onSelectionUpdate: updateSuggestions,
});

watch(model, (value) => {
  const currentEditor = editor.value;
  if (currentEditor && value !== currentEditor.getText()) {
    currentEditor.commands.setContent(variableDocument(value), {
      emitUpdate: false,
    });
  }
});

watch(
  () => props.disabled,
  (disabled) => editor.value?.setEditable(!disabled),
);

watch(
  [variableRange, activeIndex, filteredVariables, () => props.error],
  () => {
    const editorElement = editor.value?.view.dom;
    if (!editorElement) return;

    editorElement.setAttribute("aria-invalid", props.error ? "true" : "false");
    if (props.error) editorElement.setAttribute("aria-describedby", errorId);
    else editorElement.removeAttribute("aria-describedby");

    if (variableRange.value && filteredVariables.value.length) {
      editorElement.setAttribute("aria-controls", listboxId);
      editorElement.setAttribute("aria-expanded", "true");
      editorElement.setAttribute(
        "aria-activedescendant",
        `${listboxId}-option-${activeIndex.value}`,
      );
    } else {
      editorElement.removeAttribute("aria-controls");
      editorElement.removeAttribute("aria-activedescendant");
      editorElement.setAttribute("aria-expanded", "false");
    }
  },
  { flush: "post" },
);

defineExpose({ insertVariable });
</script>

<template>
  <div ref="container" class="relative min-w-0 space-y-1.5">
    <div
      class="overflow-hidden rounded-md border bg-transparent shadow-xs outline-2 -outline-offset-1 outline-transparent transition-[border-color,box-shadow,outline-color] focus-within:border-ring focus-within:outline-ring/70 dark:bg-input/30"
      :class="
        error &&
        'border-destructive focus-within:border-destructive focus-within:outline-destructive/70'
      "
    >
      <EditorContent v-if="editor" :editor="editor" class="variable-input" />
      <div v-else class="h-9" aria-hidden="true" />
    </div>

    <UiAutomationsVariableSuggestions
      v-if="variableRange"
      :id="listboxId"
      :variables="filteredVariables"
      :active-index="activeIndex"
      :position="menuPosition ?? undefined"
      @activate="setActiveIndex"
      @select="insertVariable"
    />

    <p v-if="error" :id="errorId" class="text-xs text-destructive">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.variable-input :deep(.tiptap p) {
  margin: 0;
}

.variable-input :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--muted-foreground);
}

.variable-input :deep([data-variable-token]) {
  display: inline-flex;
  align-items: center;
  border-radius: 0.375rem;
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--primary) 22%, transparent);
  color: var(--primary);
  padding-inline: 0.375rem;
  font-family: "Geist Mono", monospace;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5rem;
  white-space: nowrap;
}

.variable-input :deep([data-variable-token].ProseMirror-selectednode) {
  box-shadow: inset 0 0 0 2px var(--ring);
}
</style>
