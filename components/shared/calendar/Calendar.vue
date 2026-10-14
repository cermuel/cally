<script setup lang="ts">
import type { DateValue } from "reka-ui";
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
} from "reka-ui";
import { ChevronLeftIcon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { HTMLAttributes } from "vue";
import { computed, useAttrs } from "vue";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "../button";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    size?: "sm" | "base" | "lg";
  }>(),
  {
    size: "base",
  },
);

const attrs = useAttrs();
const gridCellClass = computed(() => {
  if (props.size === "sm") return "size-8";
  if (props.size === "lg") return "size-10";
  return "size-9";
});
</script>

<template>
  <CalendarRoot
    v-slot="{ grid, weekDays }"
    data-slot="calendar"
    :data-size="size"
    v-bind="attrs"
    :class="cn('p-3', props.class)"
  >
    <CalendarHeader
      class="relative flex w-full items-center justify-center pt-1"
    >
      <CalendarPrev
        :class="
          cn(
            buttonVariants({ variant: 'outline', size: 'icon' }),
            'absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          )
        "
      >
        <HugeiconsIcon
          :icon="ChevronLeftIcon"
          :size="16"
          color="currentColor"
          :stroke-width="1.75"
        />
      </CalendarPrev>
      <CalendarHeading class="text-sm font-medium" />
      <CalendarNext
        :class="
          cn(
            buttonVariants({ variant: 'outline', size: 'icon' }),
            'absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          )
        "
      >
        <HugeiconsIcon
          :icon="ChevronRightIcon"
          :size="16"
          color="currentColor"
          :stroke-width="1.75"
        />
      </CalendarNext>
    </CalendarHeader>
    <div class="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <CalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
        class="w-full border-collapse space-y-1"
      >
        <CalendarGridHead>
          <CalendarGridRow class="flex gap-1">
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              :class="cn(gridCellClass, 'rounded-md text-[0.8rem] font-normal text-muted-foreground')"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="`week-${index}`"
            class="mt-2 flex w-full gap-1"
          >
            <CalendarCell
              v-for="date in weekDates"
              :key="(date as DateValue).toString()"
              :date="date"
              :class="cn(gridCellClass, 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20')"
            >
              <CalendarCellTrigger
                :day="date"
                :month="month.value"
                :class="
                  cn(
                    buttonVariants({ variant: 'ghost' }),
                    gridCellClass,
                    'p-0 font-normal aria-selected:opacity-100 data-selected:bg-primary data-selected:text-primary-foreground data-today:bg-accent data-today:text-accent-foreground data-outside-view:text-muted-foreground data-outside-view:opacity-50 data-disabled:text-muted-foreground data-disabled:opacity-50',
                  )
                "
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
