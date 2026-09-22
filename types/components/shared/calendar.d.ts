import type { CalendarRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface CalendarProps extends CalendarRootProps {
  class?: HTMLAttributes['class']
}
