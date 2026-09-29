<script setup lang="ts">
import { normalizeUsername } from "~/helpers/onboarding";
import type { AuthUser } from "~/utils/api/auth";
import type { EditProfilePayload } from "~/utils/api/users";

const props = defineProps<{
  user: AuthUser;
  saving?: boolean;
  errors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
  save: [payload: EditProfilePayload];
}>();

const AVATAR_SIZE = 256;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const initial = computed(() => ({
  name: props.user.name ?? "",
  username: props.user.username ?? "",
  avatar_url: props.user.avatar ?? "",
  description: props.user.description ?? "",
}));

const form = reactive({ ...initial.value });

watch(initial, (value) => Object.assign(form, value));

const changedPayload = computed(() => {
  const payload: EditProfilePayload = {};
  const clean = {
    name: form.name.trim(),
    username: form.username.trim(),
    description: form.description.trim(),
  };

  if (clean.name !== initial.value.name) payload.name = clean.name;
  if (clean.username !== initial.value.username) {
    payload.username = clean.username;
  }
  if (form.avatar_url !== initial.value.avatar_url) {
    payload.avatar_url = form.avatar_url;
  }
  if (clean.description !== initial.value.description) {
    payload.description = clean.description || null;
  }

  return payload;
});

const hasChanges = computed(() => Object.keys(changedPayload.value).length > 0);
const fieldError = (field: string) => props.errors?.[field]?.[0];
const fileInput = ref<HTMLInputElement | null>(null);
const avatarError = ref<string>();
const avatarName = computed(() => form.name || form.username || "?");
const avatarMessage = computed(
  () => avatarError.value || fieldError("avatar_url"),
);

const toAvatarDataUrl = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  canvas
    .getContext("2d")!
    .drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );
  bitmap.close();

  return canvas.toDataURL("image/webp", 0.85);
};

const pickAvatar = () => fileInput.value?.click();

const onFile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    avatarError.value = "Choose an image file.";
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    avatarError.value = "That image is over 10 MB.";
    return;
  }

  try {
    form.avatar_url = await toAvatarDataUrl(file);
    avatarError.value = undefined;
  } catch {
    avatarError.value = "We couldn’t read that image.";
  }
};

const removeAvatar = () => {
  form.avatar_url = "";
  avatarError.value = undefined;
};

const discard = () => {
  Object.assign(form, initial.value);
  avatarError.value = undefined;
};

const submit = () => {
  if (hasChanges.value) emit("save", changedPayload.value);
};
</script>

<template>
  <form
    class="overflow-hidden rounded-xl border border-border bg-card"
    @submit.prevent="submit"
  >
    <div class="space-y-6 p-5 sm:p-6">
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="group relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none"
          aria-label="Change profile photo"
          :disabled="saving"
          @click="pickAvatar"
        >
          <SharedAvatar
            :image="form.avatar_url"
            :name="avatarName"
            class="size-16"
          />
          <span
            class="absolute inset-0 grid place-items-center rounded-full bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            Change
          </span>
        </button>

        <div class="flex flex-wrap gap-2">
          <SharedButton
            type="button"
            size="sm"
            variant="outline"
            :disabled="saving"
            @click="pickAvatar"
          >
            {{ form.avatar_url ? "Change photo" : "Upload photo" }}
          </SharedButton>
          <SharedButton
            v-if="form.avatar_url"
            type="button"
            size="sm"
            variant="ghost"
            :disabled="saving"
            @click="removeAvatar"
          >
            Remove
          </SharedButton>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          class="hidden"
          tabindex="-1"
          @change="onFile"
        />
      </div>

      <div class="grid gap-4">
        <div>
          <SharedLabel for="profile-name" class="mb-1.5 text-sm"
            >Name</SharedLabel
          >
          <SharedInput
            id="profile-name"
            v-model="form.name"
            name="name"
            autocomplete="name"
            :disabled="saving"
            :error="fieldError('name')"
          />
        </div>
        <div>
          <SharedLabel for="profile-username" class="mb-1.5 text-sm"
            >Username</SharedLabel
          >
          <SharedInput
            id="profile-username"
            :model-value="form.username"
            name="username"
            autocomplete="username"
            autocapitalize="off"
            spellcheck="false"
            :disabled="saving"
            :error="fieldError('username')"
            @update:model-value="
              form.username = normalizeUsername(String($event))
            "
          >
            <template #prefix>
              <span
                class="flex h-full items-center border-r border-border bg-muted px-3 text-sm text-muted-foreground"
              >
                cally.cermuel.dev/
              </span>
            </template>
          </SharedInput>
        </div>
      </div>

      <div>
        <SharedLabel class="mb-1.5 text-sm">About you</SharedLabel>
        <UiProfileRichTextEditor
          v-model="form.description"
          :disabled="saving"
          :error="fieldError('description')"
        />
      </div>
    </div>

    <footer
      class="flex items-center justify-between gap-4 border-t border-border bg-muted/30 px-5 py-3 sm:px-6"
    >
      <p
        class="flex items-center gap-2 text-xs text-muted-foreground"
        aria-live="polite"
      >
        <template v-if="hasChanges">
          <span class="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          Unsaved changes
        </template>
      </p>
      <div class="flex gap-2">
        <SharedButton
          v-if="hasChanges && !saving"
          type="button"
          variant="ghost"
          @click="discard"
        >
          Discard
        </SharedButton>
        <SharedButton type="submit" :disabled="!hasChanges" :loading="saving">
          Save changes
        </SharedButton>
      </div>
    </footer>
  </form>
</template>
