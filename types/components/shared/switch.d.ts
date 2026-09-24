import type { SwitchRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface SwitchProps extends SwitchRootProps {
  class?: HTMLAttributes['class']
}
