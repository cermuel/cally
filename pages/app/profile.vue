<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import { usersApi, type EditProfilePayload } from "~/utils/api/users";

definePageMeta({ layout: false });
useHead({ title: "Profile | Cally" });

const auth = useAuth();
const client = useApiClient();
const editErrors = ref<Record<string, string[]>>({});
const user = computed(() => auth.user.value);
const publicPath = computed(() =>
  user.value?.username ? `/${user.value.username}` : null,
);
const deleteConfirmText = computed(
  () => `delete/${user.value?.username || "username"}`,
);

const editMutation = useMutation({
  mutationFn: (payload: EditProfilePayload) =>
    usersApi.editProfile(client, payload),
  onSuccess: (response) => {
    auth.setUser(response.user);
    editErrors.value = {};
  },
  onError: (error) => {
    editErrors.value = getApiFieldErrors(error);
  },
});

const saveProfile = (payload: EditProfilePayload) => {
  editErrors.value = {};
  toast.promise(editMutation.mutateAsync(payload), {
    loading: "Saving profile...",
    success: "Profile updated",
    error: (error) =>
      getApiErrorMessage(error, "Could not update your profile."),
  });
};

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
</script>

<template>
  <UiAppShell>
    <div class="mx-auto max-w-160">
      <div v-if="user" class="space-y-8">
        <UiProfileForm
          :user="user"
          :saving="editMutation.isPending.value"
          :errors="editErrors"
          @save="saveProfile"
        />

        <UiProfileDangerZone
          :confirm-text="deleteConfirmText"
          :deleting="deleteMutation.isPending.value"
          @delete="deleteMutation.mutate()"
        />
      </div>
    </div>
  </UiAppShell>
</template>
