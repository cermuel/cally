<script setup lang="ts" generic="Row extends Record<string, unknown>">
import {
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  type Component,
  type CSSProperties,
  type PropType,
} from "vue";
import type {
  SharedTableColumn,
  SharedTableRenderable,
  SharedTableRowKey,
} from "~/types/table";
import type { TableResizeEdge } from "~/composables/useResizableTable";

const TableContent = defineComponent({
  props: {
    content: {
      type: null as unknown as PropType<SharedTableRenderable>,
      required: true,
    },
    renderProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
  },
  setup(contentProps) {
    return () => {
      if (isVNode(contentProps.content)) {
        return cloneVNode(contentProps.content, contentProps.renderProps);
      }

      if (
        typeof contentProps.content === "string" ||
        typeof contentProps.content === "number"
      ) {
        return String(contentProps.content);
      }

      return h(contentProps.content as Component, contentProps.renderProps);
    };
  },
});

const props = withDefaults(
  defineProps<{
    columns: SharedTableColumn<Row>[];
    rows: Row[];
    rowKey: SharedTableRowKey<Row> | ((row: Row, index: number) => PropertyKey);
    label?: string;
    loading?: boolean;
    loadingRows?: number;
    emptyTitle?: string;
    emptyDescription?: string;
    resizable?: boolean;
    resizeEdge?: TableResizeEdge;
    minimumWidth?: number;
  }>(),
  {
    label: "Data table",
    loading: false,
    loadingRows: 5,
    emptyTitle: "No results",
    emptyDescription: "There is no data to show yet.",
    resizable: true,
    resizeEdge: "right",
    minimumWidth: 320,
  },
);

const resizeContainer = ref<HTMLElement | null>(null);
const layoutReady = ref(false);
let layoutReadyFrame: number | undefined;

const minimumResizeWidth = computed(() => Math.max(props.minimumWidth, 240));
const {
  containerWidth,
  isDragging,
  left,
  minimum,
  resetWidth,
  resizeWithKeyboard,
  startResize,
  width,
} = useResizableTable(resizeContainer, minimumResizeWidth);

const tableWidth = computed(() =>
  containerWidth.value ? width.value : 0,
);

watch(
  containerWidth,
  (nextWidth) => {
    if (!nextWidth || layoutReady.value || layoutReadyFrame !== undefined)
      return;

    layoutReadyFrame = requestAnimationFrame(() => {
      layoutReady.value = true;
      layoutReadyFrame = undefined;
    });
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  if (layoutReadyFrame !== undefined) cancelAnimationFrame(layoutReadyFrame);
});

const resizeShellStyle = computed<CSSProperties>(() => ({
  width: containerWidth.value ? `${width.value}px` : "100%",
  marginLeft: `${left.value}px`,
}));

const columnMinWidth = (column: SharedTableColumn<Row>) =>
  column.minWidth ?? 144;

const visibleColumnIds = computed(() => {
  if (!tableWidth.value) {
    return new Set(props.columns.map((column) => column.id));
  }

  const visible = new Set(props.columns.map((column) => column.id));
  let requiredWidth = props.columns.reduce(
    (total, column) => total + columnMinWidth(column),
    0,
  );

  const hideableColumns = props.columns
    .map((column, index) => ({ column, index }))
    .filter(({ column }) => !column.alwaysVisible)
    .sort(
      (a, b) =>
        b.column.priority - a.column.priority || b.index - a.index,
    );

  for (const { column } of hideableColumns) {
    if (requiredWidth <= tableWidth.value) break;

    visible.delete(column.id);
    requiredWidth -= columnMinWidth(column);
  }

  return visible;
});

const gridTemplateColumns = computed(() => {
  return props.columns
    .map((column) => {
      const trackWeight = visibleColumnIds.value.has(column.id)
        ? columnMinWidth(column)
        : 0;

      return `minmax(0px, ${trackWeight}fr)`;
    })
    .join(" ");
});

const gridStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns: gridTemplateColumns.value,
}));

const visibleColumnCount = computed(() => visibleColumnIds.value.size);

const resolveRowKey = (row: Row, index: number): PropertyKey =>
  typeof props.rowKey === "function"
    ? props.rowKey(row, index)
    : (row[props.rowKey] as PropertyKey);

const resolveValue = (row: Row, column: SharedTableColumn<Row>) => {
  if (typeof column.accessor === "function") return column.accessor(row);
  return row[column.accessor ?? column.id];
};

const headerProps = (column: SharedTableColumn<Row>) => ({ column });

const bodyProps = (
  row: Row,
  column: SharedTableColumn<Row>,
  rowIndex: number,
) => ({
  row,
  value: resolveValue(row, column),
  column,
  rowIndex,
});

const alignmentClass = (column: SharedTableColumn<Row>) => {
  if (column.align === "center") return "justify-center text-center";
  if (column.align === "end") return "justify-end text-end";
  return "justify-start text-start";
};

const visibleColumnIndex = (columnIndex: number) => {
  let visibleIndex = 0;

  for (let index = 0; index <= columnIndex; index += 1) {
    if (visibleColumnIds.value.has(props.columns[index]!.id)) visibleIndex += 1;
  }

  return visibleIndex;
};

</script>

<template>
  <div ref="resizeContainer" class="w-full">
    <div
      class="resizable-table-shell relative"
      :class="{
        'resizable-table-shell--ready': layoutReady,
        'resizable-table-shell--dragging': isDragging,
      }"
      :style="resizeShellStyle"
    >
      <div
        role="table"
        :aria-label="label"
        :aria-colcount="visibleColumnCount"
        :aria-rowcount="loading ? undefined : rows.length + 1"
        :aria-busy="loading"
        class="w-full overflow-hidden rounded-xl border border-border bg-card text-sm"
      >
    <div role="rowgroup" class="border-b border-border bg-muted/35">
      <div role="row" class="animated-table-grid" :style="gridStyle">
        <div
          v-for="(column, columnIndex) in columns"
          :key="column.id"
          role="columnheader"
          :aria-colindex="
            visibleColumnIds.has(column.id)
              ? visibleColumnIndex(columnIndex)
              : undefined
          "
          :aria-hidden="!visibleColumnIds.has(column.id)"
          :inert="!visibleColumnIds.has(column.id) || undefined"
          :data-hidden="!visibleColumnIds.has(column.id)"
          :data-priority="column.priority"
          class="animated-table-cell flex h-10 min-w-0 items-center overflow-hidden px-4 text-xs font-medium whitespace-nowrap text-muted-foreground"
          :class="[alignmentClass(column), column.headerClassName]"
        >
          <button
            v-if="column.onHeaderClick"
            type="button"
            class="flex size-full min-w-0 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            :class="alignmentClass(column)"
            @click="column.onHeaderClick(column)"
          >
            <slot name="header" :column="column">
              <TableContent
                :content="column.header"
                :render-props="headerProps(column)"
              />
            </slot>
          </button>
          <slot v-else name="header" :column="column">
            <TableContent
              :content="column.header"
              :render-props="headerProps(column)"
            />
          </slot>
        </div>
      </div>
    </div>

    <div v-if="loading" role="rowgroup" aria-label="Loading rows">
      <div
        v-for="index in loadingRows"
        :key="index"
        role="row"
        class="animated-table-grid border-b border-border last:border-b-0"
        :style="gridStyle"
      >
        <div
          v-for="column in columns"
          :key="column.id"
          role="cell"
          :aria-hidden="!visibleColumnIds.has(column.id)"
          :inert="!visibleColumnIds.has(column.id) || undefined"
          :data-hidden="!visibleColumnIds.has(column.id)"
          :data-priority="column.priority"
          class="animated-table-cell flex h-12 min-w-0 items-center overflow-hidden px-4"
          :class="alignmentClass(column)"
        >
          <div class="h-3 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>

    <TransitionGroup
      v-else-if="rows.length"
      name="animated-table-row"
      tag="div"
      role="rowgroup"
      class="relative"
    >
      <div
        v-for="(row, rowIndex) in rows"
        :key="resolveRowKey(row, rowIndex)"
        role="row"
        :aria-rowindex="rowIndex + 2"
        class="animated-table-grid border-b border-border last:border-b-0"
        :style="gridStyle"
      >
        <div
          v-for="(column, columnIndex) in columns"
          :key="column.id"
          role="cell"
          :aria-colindex="
            visibleColumnIds.has(column.id)
              ? visibleColumnIndex(columnIndex)
              : undefined
          "
          :aria-hidden="!visibleColumnIds.has(column.id)"
          :inert="!visibleColumnIds.has(column.id) || undefined"
          :data-hidden="!visibleColumnIds.has(column.id)"
          :data-priority="column.priority"
          class="animated-table-cell flex h-12 min-w-0 items-center overflow-hidden px-4 whitespace-nowrap"
          :class="[alignmentClass(column), column.bodyClassName]"
        >
          <slot
            :name="`cell-${column.id}`"
            :row="row"
            :column="column"
            :value="resolveValue(row, column)"
            :row-index="rowIndex"
          >
            <TableContent
              v-if="column.body !== undefined"
              :content="column.body"
              :render-props="bodyProps(row, column, rowIndex)"
            />
            <slot
              v-else
              name="cell"
              :row="row"
              :column="column"
              :value="resolveValue(row, column)"
              :row-index="rowIndex"
            >
              <span class="truncate">{{ resolveValue(row, column) }}</span>
            </slot>
          </slot>
        </div>
      </div>
    </TransitionGroup>

        <div v-else role="rowgroup">
          <div role="row">
            <div
              role="cell"
              :aria-colspan="visibleColumnCount"
              class="px-6 py-12 text-center"
            >
              <slot name="empty">
                <p class="font-medium">{{ emptyTitle }}</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ emptyDescription }}
                </p>
              </slot>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="resizable"
        role="separator"
        aria-orientation="vertical"
        :aria-label="`Resize table from the ${resizeEdge}`"
        :aria-valuemin="Math.round(minimum)"
        :aria-valuemax="Math.round(containerWidth)"
        :aria-valuenow="Math.round(width)"
        tabindex="0"
        class="table-resize-handle"
        :class="`table-resize-handle--${resizeEdge}`"
        @pointerdown="startResize($event, resizeEdge)"
        @dblclick="resetWidth"
        @keydown="resizeWithKeyboard($event, resizeEdge)"
      >
        <span class="table-resize-indicator" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.resizable-table-shell {
  transition: none;
}

.resizable-table-shell--ready {
  transition:
    width 240ms var(--ease-in-out),
    margin-left 240ms var(--ease-in-out);
}

.resizable-table-shell--dragging {
  transition: none;
}

.table-resize-handle {
  position: absolute;
  inset-block: 0;
  z-index: 20;
  width: 0.75rem;
  cursor: col-resize;
  touch-action: none;
  outline: none;
}

.table-resize-handle--left {
  left: -0.375rem;
}

.table-resize-handle--right {
  right: -0.375rem;
}

.table-resize-indicator {
  position: absolute;
  inset-block: 0.75rem;
  left: 50%;
  width: 2px;
  border-radius: 9999px;
  background: var(--ring);
  opacity: 0.28;
  transform: translateX(-50%) scaleY(0.88);
  transition:
    opacity 150ms ease,
    transform 150ms var(--ease-out);
}

.table-resize-handle:focus-visible .table-resize-indicator {
  opacity: 1;
  transform: translateX(-50%) scaleY(1);
}

@media (hover: hover) and (pointer: fine) {
  .table-resize-handle:hover .table-resize-indicator {
    opacity: 1;
    transform: translateX(-50%) scaleY(1);
  }
}

.resizable-table-shell--dragging
  .table-resize-handle
  .table-resize-indicator {
  opacity: 1;
  transform: translateX(-50%) scaleY(1);
}

.animated-table-grid {
  display: grid;
  transition: background-color 150ms ease;
}

.resizable-table-shell--ready .animated-table-grid {
  transition:
    grid-template-columns 240ms var(--ease-in-out),
    background-color 150ms ease;
}

.animated-table-cell {
  opacity: 1;
  transform: translateX(0) scale(1);
  transform-origin: right center;
  transition:
    opacity 180ms var(--ease-out),
    transform 220ms var(--ease-out);
}

.animated-table-cell[data-hidden="true"] {
  pointer-events: none;
  opacity: 0;
  transform: translateX(8px) scale(0.97);
}

.animated-table-row-enter-active,
.animated-table-row-leave-active {
  transition:
    opacity 180ms var(--ease-out),
    transform 180ms var(--ease-out);
}

.animated-table-row-enter-from,
.animated-table-row-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.animated-table-row-leave-active {
  position: absolute;
  inset-inline: 0;
}

.animated-table-row-move {
  transition: transform 220ms var(--ease-in-out);
}

@media (prefers-reduced-motion: reduce) {
  .resizable-table-shell {
    transition: none;
  }

  .table-resize-indicator {
    transform: translateX(-50%);
    transition: opacity 150ms ease;
  }

  .table-resize-handle:focus-visible .table-resize-indicator {
    transform: translateX(-50%);
  }

  .animated-table-grid {
    transition: background-color 150ms ease;
  }

  .animated-table-cell {
    transition: opacity 150ms var(--ease-out);
  }

  .animated-table-cell[data-hidden="true"] {
    opacity: 0;
    transform: none;
  }

  .animated-table-row-enter-active,
  .animated-table-row-leave-active {
    transition: opacity 150ms var(--ease-out);
  }

  .animated-table-row-enter-from,
  .animated-table-row-leave-to {
    transform: none;
  }

  .animated-table-row-move {
    transition: none;
  }
}
</style>
