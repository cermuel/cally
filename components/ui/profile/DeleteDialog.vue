<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { usersApi } from "~/utils/api/users";

const open = defineModel<boolean>("open", { default: false });
const auth = useAuth();
const client = useApiClient();
const typed = ref("");
const confirmText = computed(
  () => `delete/${auth.user.value?.username || "username"}`,
);
const canDelete = computed(() => typed.value.trim() === confirmText.value);

const deleteMutation = useMutation({
  mutationFn: () => usersApi.deleteAccount(client),
  onSuccess: async () => {
    auth.clearAuth();
    toast.success("Account deleted");
    await navigateTo("/auth/login");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete your account.")),
});

watch(open, (isOpen) => {
  if (!isOpen) typed.value = "";
});

const submit = () => {
  if (canDelete.value && !deleteMutation.isPending.value) {
    deleteMutation.mutate();
  }
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/3 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        @escape-key-down="deleteMutation.isPending.value && $event.preventDefault()"
        @pointer-down-outside="deleteMutation.isPending.value && $event.preventDefault()"
      >
        <div>
          <DialogTitle class="text-lg font-semibold"
            >Delete your account?</DialogTitle
          >
          <DialogDescription
            class="mt-2 text-sm leading-6 text-muted-foreground"
          >
            This permanently deletes your profile, booking links, availability,
            and booking history. You can’t undo this.
          </DialogDescription>

          <SharedLabel
            for="delete-account-confirmation"
            class="mb-1.5 mt-5 text-sm"
          >
            Type
            <span class="font-mono font-semibold text-foreground">{{
              confirmText
            }}</span>
            to confirm
          </SharedLabel>
          <SharedInput
            id="delete-account-confirmation"
            v-model="typed"
            name="delete-account-confirmation"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="confirmText"
            :disabled="deleteMutation.isPending.value"
          />

          <div
            class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
          >
            <DialogClose as-child>
              <SharedButton type="button" variant="outline" :disabled="deleteMutation.isPending.value"
                >Cancel</SharedButton
              >
            </DialogClose>
            <SharedButton
              type="button"
              variant="destructive"
              :disabled="!canDelete"
              :loading="deleteMutation.isPending.value"
              @click="submit"
            >
              Delete account
            </SharedButton>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
