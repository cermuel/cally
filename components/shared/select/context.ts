import type { ComputedRef, InjectionKey } from "vue";

export interface SelectContext {
  loading: ComputedRef<boolean>;
}

export const SELECT_CONTEXT_KEY: InjectionKey<SelectContext> =
  Symbol("select");
