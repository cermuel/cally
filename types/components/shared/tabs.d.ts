import type {
  TabsContentProps as RekaTabsContentProps,
  TabsIndicatorProps as RekaTabsIndicatorProps,
  TabsListProps as RekaTabsListProps,
  TabsRootProps,
  TabsTriggerProps as RekaTabsTriggerProps,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { TabsListVariants } from '../../../components/shared/tabs/variants'

export interface TabsProps extends TabsRootProps {
  class?: HTMLAttributes['class']
}

export interface TabsListProps extends RekaTabsListProps {
  class?: HTMLAttributes['class']
  showIndicator?: boolean
  variant?: TabsListVariants['variant']
}

export interface TabsTriggerProps extends RekaTabsTriggerProps {
  class?: HTMLAttributes['class']
}

export interface TabsContentProps extends RekaTabsContentProps {
  class?: HTMLAttributes['class']
}

export interface TabsIndicatorProps extends RekaTabsIndicatorProps {
  class?: HTMLAttributes['class']
}
