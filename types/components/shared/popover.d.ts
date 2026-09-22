import type { PopoverContentProps, PopoverRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface PopoverProps extends PopoverRootProps {}

export interface PopoverContentSharedProps extends PopoverContentProps {
  class?: HTMLAttributes['class']
}
