import type { VNodeChild } from "vue";

export type SearchSelectValue = string | number;

export type SearchSelectContent =
  | VNodeChild
  | (() => VNodeChild);

export interface SearchSelectItem {
  value: SearchSelectValue;
  label: SearchSelectContent;
  textValue: string;
  rightSection?: SearchSelectContent;
  disabled?: boolean;
}

export type SearchSelectSearch<TItem = SearchSelectItem> = (
  query: string,
) => Promise<readonly TItem[]> | readonly TItem[];
