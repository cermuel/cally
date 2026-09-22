import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface BreadcrumbProps {
  class?: HTMLAttributes['class']
}

export type BreadcrumbListProps = BreadcrumbProps
export type BreadcrumbItemProps = BreadcrumbProps
export type BreadcrumbPageProps = BreadcrumbProps
export type BreadcrumbSeparatorProps = BreadcrumbProps
export type BreadcrumbEllipsisProps = BreadcrumbProps

export interface BreadcrumbLinkProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}
