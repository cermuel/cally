import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const tabsListVariants = cva(
  'group/tabs-list relative isolate inline-flex w-fit items-center justify-center overflow-hidden rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:overflow-visible data-[variant=line]:rounded-none data-[variant=line]:p-0',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type TabsListVariants = VariantProps<typeof tabsListVariants>
