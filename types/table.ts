import type { Component, HTMLAttributes, VNode } from "vue";

export type SharedTableColumnAlign = "start" | "center" | "end";
export type SharedTableColumnPriority = 1 | 2 | 3 | 4 | 5 | 6;

export type SharedTableRowKey<Row> = {
  [Key in keyof Row]: Row[Key] extends PropertyKey ? Key : never;
}[keyof Row];

export type SharedTableRenderable = string | number | Component | VNode;

export interface SharedTableBodyProps<Row> {
  row: Row;
  value: unknown;
  column: SharedTableColumn<Row>;
  rowIndex: number;
}

export interface SharedTableHeaderProps<Row> {
  column: SharedTableColumn<Row>;
}

export interface SharedTableColumn<Row> {
  id: string;
  header: SharedTableRenderable;
  body?: SharedTableRenderable;
  accessor?: keyof Row | ((row: Row) => unknown);
  headerClassName?: HTMLAttributes["class"];
  bodyClassName?: HTMLAttributes["class"];
  onHeaderClick?: (column: SharedTableColumn<Row>) => void;
  minWidth?: number;
  grow?: number;
  /** Six hides first; one stays visible longest as the table narrows. */
  priority: SharedTableColumnPriority;
  alwaysVisible?: boolean;
  align?: SharedTableColumnAlign;
}
