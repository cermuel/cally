<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import type { TeamInvite, TeamRole } from "~/utils/api/teams";

const props = defineProps<{
  invite: TeamInvite | null;
  updating: boolean;
}>();

const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ confirm: [role: TeamRole] }>();
const role = ref<TeamRole>("member");

watch(
  [open, () => props.invite],
  ([isOpen, invite]) => {
    if (isOpen && invite) role.value = invite.role;
  },
  { immediate: true },
);
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-60 bg-black/60 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed top-1/3 left-1/2 z-60 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <DialogTitle class="text-lg font-semibold">
          Update invitation role
        </DialogTitle>

        <div class="mt-5 space-y-2">
          <SharedLabel for="invite-role">Role</SharedLabel>
          <SharedSelect v-model="role">
            <SharedSelectTrigger id="invite-role" class="w-full capitalize">
              <SharedSelectValue />
            </SharedSelectTrigger>
            <SharedSelectContent class="z-70">
              <SharedSelectItem value="admin">Admin</SharedSelectItem>
              <SharedSelectItem value="member">Member</SharedSelectItem>
            </SharedSelectContent>
          </SharedSelect>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <DialogClose as-child>
            <SharedButton type="button" variant="outline" :disabled="updating">
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :disabled="!invite || role === invite.role"
            :loading="updating"
            @click="emit('confirm', role)"
          >
            Update role
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
