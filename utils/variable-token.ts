import { InputRule, Node, type Editor, type JSONContent } from "@tiptap/core";

export const VARIABLE_PATTERN = /\{\{[a-z_]+\}\}/gi;

export const VariableToken = Node.create({
  name: "variableToken",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      value: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-variable-token]",
        getAttrs: (element) =>
          element instanceof HTMLElement
            ? { value: element.dataset.variable ?? element.textContent ?? "" }
            : false,
      },
    ];
  },

  renderHTML({ node }) {
    return node.attrs.value as string;
  },

  renderText({ node }) {
    return node.attrs.value as string;
  },

  addNodeView() {
    return ({ node }) => {
      const value = node.attrs.value as string;
      const dom = document.createElement("span");
      dom.dataset.variableToken = "";
      dom.dataset.variable = value;
      dom.title = "Automation variable";
      dom.textContent = value;
      return { dom };
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\{\{[a-z_]+\}\}$/i,
        handler: ({ state, range, match }) => {
          state.tr.replaceWith(
            range.from,
            range.to,
            this.type.create({ value: match[0] }),
          );
        },
      }),
    ];
  },
});

export const variableDocument = (text: string): JSONContent => {
  const content: JSONContent[] = [];
  let offset = 0;

  for (const match of text.matchAll(VARIABLE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > offset) {
      content.push({ type: "text", text: text.slice(offset, index) });
    }
    content.push({ type: "variableToken", attrs: { value: match[0] } });
    offset = index + match[0].length;
  }

  if (offset < text.length) {
    content.push({ type: "text", text: text.slice(offset) });
  }

  return {
    type: "doc",
    content: [{ type: "paragraph", ...(content.length ? { content } : {}) }],
  };
};

export const convertVariablesToTokens = (editor: Editor) => {
  const replacements: Array<{ from: number; to: number; value: string }> = [];

  editor.state.doc.descendants((node, position) => {
    if (!node.isText || !node.text) return;

    for (const match of node.text.matchAll(VARIABLE_PATTERN)) {
      const index = match.index ?? 0;
      replacements.push({
        from: position + index,
        to: position + index + match[0].length,
        value: match[0],
      });
    }
  });

  if (!replacements.length) return;

  const transaction = editor.state.tr;
  for (const replacement of replacements.reverse()) {
    transaction.replaceWith(
      replacement.from,
      replacement.to,
      editor.schema.nodes.variableToken.create({ value: replacement.value }),
    );
  }
  editor.view.dispatch(transaction);
};
