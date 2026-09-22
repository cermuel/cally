import type { HoverCardContentProps, HoverCardRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface HoverCardProps extends HoverCardRootProps {
  class?: HTMLAttributes['class']
}

export interface HoverCardContentSharedProps extends HoverCardContentProps {
  class?: HTMLAttributes['class']
}
