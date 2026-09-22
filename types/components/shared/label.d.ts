import type { LabelProps as RekaLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface LabelProps extends RekaLabelProps {
  class?: HTMLAttributes['class']
}
