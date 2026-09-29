<script setup lang="ts">
import {
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  TextBoldIcon,
  TextItalicIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Placeholder } from "@tiptap/extensions";
import { FontFamily, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { LinkChip } from "~/utils/link-chip";

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    error?: string;
    placeholder?: string;
  }>(),
  { disabled: false, placeholder: "Tell people a little about yourself…" },
);

const model = defineModel<string>({ default: "" });
const editorVersion = ref(0);

const fontFamilies = [
  { label: "Geist", value: "Geist, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "Geist Mono, monospace" },
];

const serialize = (html: string) => (html === "<p></p>" ? "" : html);

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
      underline: false,
      link: {
        autolink: false,
        openOnClick: false,
        linkOnPaste: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      },
    }),
    TextStyle,
    FontFamily,
    LinkChip,
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  editorProps: {
    attributes: {
      class: "min-h-36 px-3.5 py-3 text-sm leading-6 outline-none",
      "aria-label": "Profile description",
    },
    handleDOMEvents: {
      click: (_view, event) => {
        const anchor = (event.target as HTMLElement).closest?.(
          "a[href]",
        ) as HTMLAnchorElement | null;
        if (anchor && (event.metaKey || event.ctrlKey)) {
          window.open(anchor.href, "_blank", "noopener,noreferrer");
          return true;
        }
        return false;
      },
    },
  },
  onUpdate: ({ editor }) => {
    model.value = serialize(editor.getHTML());
  },
  onTransaction: () => {
    editorVersion.value += 1;
  },
});

watch(model, (value) => {
  const e = editor.value;
  if (e && value !== serialize(e.getHTML()))
    e.commands.setContent(value, { emitUpdate: false });
});

watch(
  () => props.disabled,
  (disabled) => editor.value?.setEditable(!disabled),
);

const tools = computed(() => {
  editorVersion.value;
  const e = editor.value;
  return [
    {
      label: "Bold",
      icon: TextBoldIcon,
      active: !!e?.isActive("bold"),
      run: () => e?.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: TextItalicIcon,
      active: !!e?.isActive("italic"),
      run: () => e?.chain().focus().toggleItalic().run(),
    },
    {
      label: "Bulleted list",
      icon: LeftToRightListBulletIcon,
      active: !!e?.isActive("bulletList"),
      separator: true,
      run: () => e?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: LeftToRightListNumberIcon,
      active: !!e?.isActive("orderedList"),
      run: () => e?.chain().focus().toggleOrderedList().run(),
    },
  ];
});

const textStyle = computed<Record<string, string>>(() => {
  editorVersion.value;
  return editor.value?.getAttributes("textStyle") ?? {};
});

const currentFontFamily = computed(() => textStyle.value.fontFamily);

const setFontFamily = (value: unknown) => {
  if (typeof value !== "string") return;

  const currentEditor = editor.value;
  if (!currentEditor) return;

  const chain = currentEditor.chain().focus();
  if (
    currentEditor.state.selection.empty &&
    currentEditor.state.doc.textContent.trim()
  ) {
    chain.selectAll();
  }
  chain.setFontFamily(value).run();
};

const inNamedLink = computed(() => !!editor.value?.isActive("link"));
const removeLink = () =>
  editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
</script>

<template>
  <div class="space-y-1.5">
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
        aria-label="Description formatting"
        class="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1"
      >
        <SharedSelect
          :model-value="currentFontFamily"
          :disabled="disabled || !editor"
          @update:model-value="setFontFamily"
        >
          <SharedSelectTrigger
            size="sm"
            aria-label="Font family"
            class="min-w-20 border-0 bg-transparent px-2 text-xs shadow-none hover:bg-accent"
          >
            <SharedSelectValue placeholder="Font" />
          </SharedSelectTrigger>
          <SharedSelectContent>
            <SharedSelectItem
              v-for="font in fontFamilies"
              :key="font.value"
              :value="font.value"
            >
              {{ font.label }}
            </SharedSelectItem>
          </SharedSelectContent>
        </SharedSelect>

        <span class="mx-1 h-4 w-px bg-border" aria-hidden="true" />

        <template v-for="tool in tools" :key="tool.label">
          <span
            v-if="tool.separator"
            class="mx-1 h-4 w-px bg-border"
            aria-hidden="true"
          />
          <button
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
        </template>

        <button
          v-if="inNamedLink"
          type="button"
          class="ml-auto rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
          @mousedown.prevent
          @click="removeLink"
        >
          Remove link
        </button>
      </div>

      <EditorContent
        v-if="editor"
        :editor="editor"
        class="rich-text max-h-56 overflow-y-auto overscroll-contain"
      />
      <div
        v-else
        class="max-h-56 min-h-36 overflow-y-auto"
        aria-hidden="true"
      />
    </div>

    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
    <p v-else class="text-xs text-muted-foreground">
      Paste or type a link and it turns into a chip. Paste a link over selected
      text to name it.
    </p>
  </div>
</template>

<style scoped>
.rich-text :deep(.tiptap p + p) {
  margin-top: 0.5rem;
}
.rich-text :deep(.tiptap ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.rich-text :deep(.tiptap ol) {
  list-style: decimal;
  padding-left: 1.25rem;
}
.rich-text :deep(.tiptap li p) {
  margin: 0;
}

.rich-text :deep(.tiptap a) {
  color: var(--foreground);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: text;
}

.rich-text :deep(.tiptap a[data-link-chip]) {
  border-radius: 0.25rem;
  cursor: pointer;
}
.rich-text :deep(.tiptap a[data-link-chip].ProseMirror-selectednode) {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.rich-text :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--muted-foreground);
}
</style>
