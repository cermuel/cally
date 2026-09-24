<script setup lang="ts">
import type { DateValue, RangeCalendarRootEmits } from 'reka-ui'
import type { RangeCalendarProps } from '../../../types/components/shared/range-calendar.d'
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarHeader,
  RangeCalendarHeading,
  RangeCalendarNext,
  RangeCalendarPrev,
  RangeCalendarRoot,
  useForwardPropsEmits,
} from 'reka-ui'
import { ChevronLeftIcon, ChevronRightIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed } from 'vue'
import { cn } from '../../../lib/utils'
import { buttonVariants } from '../button'

const props = defineProps<RangeCalendarProps>()
const emits = defineEmits<RangeCalendarRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <RangeCalendarRoot
    v-slot="{ grid, weekDays }"
    data-slot="range-calendar"
    v-bind="forwarded"
    :class="cn('p-3', props.class)"
  >
    <RangeCalendarHeader class="relative flex w-full items-center justify-center pt-1">
      <RangeCalendarPrev
        :class="cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100')"
      >
        <HugeiconsIcon :icon="ChevronLeftIcon" :size="16" color="currentColor" :stroke-width="1.75" />
      </RangeCalendarPrev>
      <RangeCalendarHeading class="text-sm font-medium" />
      <RangeCalendarNext
        :class="cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100')"
      >
        <HugeiconsIcon :icon="ChevronRightIcon" :size="16" color="currentColor" :stroke-width="1.75" />
      </RangeCalendarNext>
    </RangeCalendarHeader>
    <div class="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <RangeCalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
        class="w-full border-collapse space-y-1"
      >
        <RangeCalendarGridHead>
          <RangeCalendarGridRow class="flex">
            <RangeCalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground"
            >
              {{ day }}
            </RangeCalendarHeadCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridHead>
        <RangeCalendarGridBody>
          <RangeCalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="`week-${index}`"
            class="mt-2 flex w-full"
          >
            <RangeCalendarCell
              v-for="date in weekDates"
              :key="(date as DateValue).toString()"
              :date="date"
              class="relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20"
            >
              <RangeCalendarCellTrigger
                :day="date"
                :month="month.value"
                :class="cn(buttonVariants({ variant: 'ghost' }), 'size-9 p-0 font-normal aria-selected:opacity-100 data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selection-start]:rounded-l-md data-[selection-end]:rounded-r-md data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[today]:bg-accent data-[today]:text-accent-foreground data-[outside-view]:text-muted-foreground data-[outside-view]:opacity-50 data-[disabled]:text-muted-foreground data-[disabled]:opacity-50')"
              />
            </RangeCalendarCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridBody>
      </RangeCalendarGrid>
    </div>
  </RangeCalendarRoot>
</template>
