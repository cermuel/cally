import type { SelectContentProps, SelectItemProps, SelectLabelProps, SelectRootProps, SelectSeparatorProps, SelectTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface SelectProps extends SelectRootProps {}

export interface SelectTriggerSharedProps extends SelectTriggerProps {
  class?: HTMLAttributes['class']
  size?: 'sm' | 'default'
}

export interface SelectContentSharedProps extends SelectContentProps {
  class?: HTMLAttributes['class']
  position?: 'popper' | 'item-aligned'
}

export interface SelectItemSharedProps extends SelectItemProps {
  class?: HTMLAttributes['class']
}

export interface SelectLabelSharedProps extends SelectLabelProps {
  class?: HTMLAttributes['class']
}

export interface SelectSeparatorSharedProps extends SelectSeparatorProps {
  class?: HTMLAttributes['class']
}
