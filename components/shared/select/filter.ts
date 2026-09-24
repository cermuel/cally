import type { ComputedRef, InjectionKey, Ref } from 'vue'

export interface SelectFilterContext {
  enabled: ComputedRef<boolean>
  placeholder: ComputedRef<string>
  query: Ref<string>
}

export const SELECT_FILTER_CONTEXT_KEY: InjectionKey<SelectFilterContext> = Symbol('select-filter')
