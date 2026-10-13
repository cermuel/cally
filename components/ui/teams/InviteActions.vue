<script setup lang="ts">
import {
  Delete02Icon,
  MoreHorizontalIcon,
  RefreshIcon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "reka-ui";

defineProps<{
  canUpdateRole: boolean;
  disabled: boolean;
  label: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  delete: [];
  resend: [];
  updateRole: [];
}>();

const open = ref(false);

const selectAction = async (
  action: "delete" | "resend" | "updateRole",
  event: CustomEvent,
) => {
  event.preventDefault();
  open.value = false;
  await nextTick();
  emit(action);
};
</script>

<template>
  <DropdownMenuRoot v-model:open="open">
    <DropdownMenuTrigger as-child>
      <SharedButton
        type="button"
        variant="ghost"
        size="icon-sm"
        class="text-muted-foreground"
        :disabled="disabled"
        :loading="loading"
        :aria-label="`Actions for ${label}`"
      >
        <HugeiconsIcon
          :icon="MoreHorizontalIcon"
          :size="18"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </SharedButton>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        align="end"
        :side-offset="4"
        class="z-50 min-w-48 rounded-md border bg-popover p-1.5 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <DropdownMenuItem
          as="button"
          type="button"
          :disabled="!canUpdateRole"
          class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[highlighted]:bg-accent"
          @select="selectAction('resend', $event)"
        >
          <HugeiconsIcon
            :icon="RefreshIcon"
            :size="16"
            :stroke-width="1.5"
            aria-hidden="true"
          />
          Resend invite
        </DropdownMenuItem>

        <DropdownMenuItem
          as="button"
          type="button"
          :disabled="!canUpdateRole"
          class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[highlighted]:bg-accent"
          @select="selectAction('updateRole', $event)"
        >
          <HugeiconsIcon
            :icon="UserEdit01Icon"
            :size="16"
            :stroke-width="1.5"
            aria-hidden="true"
          />
          Update role
        </DropdownMenuItem>

        <DropdownMenuSeparator class="my-1 h-px bg-border" />

        <DropdownMenuItem
          as="button"
          type="button"
          class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm text-destructive outline-none data-[highlighted]:bg-destructive/10"
          @select="selectAction('delete', $event)"
        >
          <HugeiconsIcon
            :icon="Delete02Icon"
            :size="16"
            :stroke-width="1.5"
            aria-hidden="true"
          />
          Revoke invite
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
