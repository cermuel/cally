<script setup lang="ts">
import {
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  TextBoldIcon,
  TextItalicIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import {
  convertVariablesToTokens,
  VariableToken,
} from "~/utils/variable-token";

const props = withDefaults(
  defineProps<{
    variables: string[];
    disabled?: boolean;
    error?: string;
  }>(),
  { disabled: false },
);

const model = defineModel<string>({ default: "" });
const editorContainer = ref<HTMLElement | null>(null);
const variableListboxId = `automation-variable-suggestions-${useId()}`;
const editorVersion = ref(0);
const variableQuery = ref("");
const variableRange = ref<{ from: number; to: number } | null>(null);
const variableMenuPosition = ref<{ top: number; left: number } | null>(null);

const serialize = (html: string) => (html === "<p></p>" ? "" : html);

const updateVariableSuggestion = () => {
  const currentEditor = editor.value;
  if (!currentEditor) return;

  const { $from } = currentEditor.state.selection;
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, "\n", "\0");
  const match = textBefore.match(/\{\{([a-z_]*)$/i);

  variableQuery.value = match?.[1] ?? "";
  variableRange.value = match
    ? { from: $from.pos - match[0].length, to: $from.pos }
    : null;

  if (!match || !editorContainer.value) {
    variableMenuPosition.value = null;
    return;
  }

  const caret = currentEditor.view.coordsAtPos($from.pos);
  const container = editorContainer.value.getBoundingClientRect();
  const menuWidth = Math.min(256, container.width - 16);

  variableMenuPosition.value = {
    top: caret.bottom - container.top + 4,
    left: Math.max(
      0,
      Math.min(caret.left - container.left, container.width - menuWidth),
    ),
  };
};

const editor = useEditor({
  content: model.value,
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      link: false,
    }),
    VariableToken,
    Placeholder.configure({
      placeholder: "Write the email guests will receive…",
    }),
  ],
  editorProps: {
    attributes: {
      class: "min-h-36 px-3.5 py-3 text-sm leading-6 outline-none",
      "aria-label": "Email message",
      "aria-autocomplete": "list",
      "aria-expanded": "false",
    },
    handleKeyDown: (_view, event) => handleVariableKeydown(event),
  },
  onUpdate: ({ editor }) => {
    model.value = serialize(editor.getHTML());
    updateVariableSuggestion();
  },
  onCreate: ({ editor }) => convertVariablesToTokens(editor),
  onSelectionUpdate: updateVariableSuggestion,
  onTransaction: () => {
    editorVersion.value += 1;
  },
});

watch(model, (value) => {
  const currentEditor = editor.value;
  if (currentEditor && value !== serialize(currentEditor.getHTML())) {
    currentEditor.commands.setContent(value, { emitUpdate: false });
    convertVariablesToTokens(currentEditor);
  }
});

watch(
  () => props.disabled,
  (disabled) => editor.value?.setEditable(!disabled),
);

const filteredVariables = computed(() => {
  if (!variableRange.value) return [];
  const query = variableQuery.value.toLowerCase();
  return props.variables.filter((variable) =>
    variable.toLowerCase().includes(query),
  );
});

const insertVariable = (variable: string) => {
  const currentEditor = editor.value;
  if (!currentEditor) return;

  if (variableRange.value) {
    currentEditor
      .chain()
      .focus()
      .deleteRange(variableRange.value)
      .insertContent({ type: "variableToken", attrs: { value: variable } })
      .run();
  } else {
    currentEditor.chain().focus().insertContent(variable).run();
  }

  variableRange.value = null;
  variableQuery.value = "";
  variableMenuPosition.value = null;
};

const closeVariableSuggestions = () => {
  variableRange.value = null;
  variableQuery.value = "";
  variableMenuPosition.value = null;
};

const {
  activeIndex: activeVariableIndex,
  handleKeydown: handleVariableKeydown,
  setActiveIndex: setActiveVariableIndex,
} = useVariableSuggestionNavigation(
  filteredVariables,
  insertVariable,
  closeVariableSuggestions,
);

watch(
  [variableRange, activeVariableIndex, filteredVariables],
  () => {
    const editorElement = editor.value?.view.dom;
    if (!editorElement) return;

    if (variableRange.value && filteredVariables.value.length) {
      editorElement.setAttribute("aria-controls", variableListboxId);
      editorElement.setAttribute("aria-expanded", "true");
      editorElement.setAttribute(
        "aria-activedescendant",
        `${variableListboxId}-option-${activeVariableIndex.value}`,
      );
      return;
    }

    editorElement.removeAttribute("aria-controls");
    editorElement.removeAttribute("aria-activedescendant");
    editorElement.setAttribute("aria-expanded", "false");
  },
  { flush: "post" },
);

const tools = computed(() => {
  editorVersion.value;
  const currentEditor = editor.value;
  return [
    {
      label: "Bold",
      icon: TextBoldIcon,
      active: !!currentEditor?.isActive("bold"),
      run: () => currentEditor?.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: TextItalicIcon,
      active: !!currentEditor?.isActive("italic"),
      run: () => currentEditor?.chain().focus().toggleItalic().run(),
    },
    {
      label: "Bulleted list",
      icon: LeftToRightListBulletIcon,
      active: !!currentEditor?.isActive("bulletList"),
      run: () => currentEditor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: LeftToRightListNumberIcon,
      active: !!currentEditor?.isActive("orderedList"),
      run: () => currentEditor?.chain().focus().toggleOrderedList().run(),
    },
  ];
});
</script>

<template>
  <div class="space-y-1.5">
    <div ref="editorContainer" class="relative">
      <div
        class="overflow-hidden rounded-lg border bg-background shadow-xs transition-[border-color,box-shadow] focus-within:ring-3"
        :class="
          error
            ? 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20'
            : 'border-input focus-within:border-ring focus-within:ring-ring/20'
        "
      >
        <div
          role="toolbar"
          aria-label="Message formatting"
          class="flex items-center gap-0.5 border-b border-border bg-muted/30 p-1"
        >
          <button
            v-for="tool in tools"
            :key="tool.label"
            type="button"
            :aria-label="tool.label"
            :title="tool.label"
            :aria-pressed="tool.active"
            :disabled="disabled || !editor"
            class="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,transform] hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50"
            :class="tool.active && 'bg-accent text-foreground'"
            @mousedown.prevent
            @click="tool.run"
          >
            <HugeiconsIcon
              :icon="tool.icon"
              :size="16"
              :stroke-width="2"
              aria-hidden="true"
            />
          </button>

          <div class="ml-auto">
            <UiAutomationsVariablePicker
              :variables="variables"
              :disabled="disabled || !editor"
              @select="insertVariable"
            />
          </div>
        </div>

        <EditorContent
          v-if="editor"
          :editor="editor"
          class="automation-rich-text max-h-56 overflow-y-auto overscroll-contain"
        />
        <div v-else class="min-h-36" aria-hidden="true" />
      </div>

      <UiAutomationsVariableSuggestions
        v-if="variableRange"
        :id="variableListboxId"
        :variables="filteredVariables"
        :active-index="activeVariableIndex"
        :position="variableMenuPosition ?? undefined"
        @activate="setActiveVariableIndex"
        @select="insertVariable"
      />
    </div>

    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
    <p v-else class="text-xs text-muted-foreground">
      Type <span class="font-mono">{{ "{{" }}</span> to insert a variable.
    </p>
  </div>
</template>

<style scoped>
.automation-rich-text :deep(.tiptap p + p) {
  margin-top: 0.5rem;
}
.automation-rich-text :deep(.tiptap ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.automation-rich-text :deep(.tiptap ol) {
  list-style: decimal;
  padding-left: 1.25rem;
}
.automation-rich-text :deep(.tiptap li p) {
  margin: 0;
}
.automation-rich-text :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--muted-foreground);
}
.automation-rich-text :deep([data-variable-token]) {
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
.automation-rich-text
  :deep([data-variable-token].ProseMirror-selectednode) {
  box-shadow: inset 0 0 0 2px var(--ring);
}
</style>
