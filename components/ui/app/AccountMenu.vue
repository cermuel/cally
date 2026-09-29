<script setup lang="ts">
import {
  Comment01Icon,
  CoPresentIcon,
  Copy01Icon,
  LinkSquare02Icon,
  Logout01Icon,
  Mail02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { toast } from "vue-sonner";
import SharedButton from "~/components/shared/button/Button.vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/shared/popover";
import { authApi } from "~/utils/api/auth";

const props = defineProps<{
  compact: boolean;
  hideCopy: boolean;
}>();

const auth = useAuth();
const apiClient = useApiClient();
const open = ref(false);
const signingOut = ref(false);

const displayName = computed(
  () => auth.user.value?.name || auth.user.value?.email || "Your account",
);
const publicPath = computed(() =>
  auth.user.value?.username ? `/${auth.user.value.username}` : null,
);

const closeMenu = () => {
  open.value = false;
};

const copyPublicProfile = async () => {
  if (!publicPath.value) return;

  try {
    await navigator.clipboard.writeText(
      new URL(publicPath.value, window.location.origin).toString(),
    );
    toast.success("Public profile link copied.");
    closeMenu();
  } catch {
    toast.error("Could not copy the public profile link.");
  }
};

const signOut = async () => {
  if (signingOut.value) return;

  signingOut.value = true;

  try {
    await authApi.logout(apiClient);
  } catch {
  } finally {
    auth.clearAuth();
    await navigateTo("/auth/login");
    signingOut.value = false;
  }
};
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <SharedButton
        variant="ghost"
        class="min-h-12 w-full rounded-xl text-start hover:bg-sidebar-accent active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        :class="
          compact ? 'px-0' : 'justify-start gap-3 bg-sidebar-accent/60 p-2'
        "
        aria-label="Open account menu"
      >
        <UiPublicProfileAvatar
          :image="auth.user.value?.avatar || undefined"
          :name="displayName"
          size="sm"
        />
        <span
          class="sidebar-copy min-w-0"
          :class="hideCopy && 'sidebar-copy--hidden'"
          :aria-hidden="hideCopy ? 'true' : undefined"
        >
          <span class="block truncate text-sm font-medium">
            {{ auth.user.value?.name || "Your account" }}
          </span>
          <span class="block truncate text-xs text-muted-foreground">
            {{ auth.user.value?.email || "Manage your profile" }}
          </span>
        </span>
      </SharedButton>
    </PopoverTrigger>

    <PopoverContent
      side="top"
      :align="compact ? 'center' : 'start'"
      :side-offset="8"
      class="w-55 rounded-xl p-1.5 shadow-xl"
    >
      <SharedButton
        as-child
        variant="ghost"
        size="sm"
        class="w-full justify-start rounded-lg px-2.5 font-normal"
      >
        <NuxtLink to="/app/profile" @click="closeMenu">
          <HugeiconsIcon :icon="CoPresentIcon" :size="17" aria-hidden="true" />
          Profile
        </NuxtLink>
      </SharedButton>

      <SharedButton
        v-if="publicPath"
        as-child
        variant="ghost"
        size="sm"
        class="w-full justify-start rounded-lg px-2.5 font-normal"
      >
        <NuxtLink target="blank" :to="publicPath" @click="closeMenu">
          <HugeiconsIcon
            :icon="LinkSquare02Icon"
            :size="17"
            aria-hidden="true"
          />
          View public profile
        </NuxtLink>
      </SharedButton>

      <SharedButton
        v-if="publicPath"
        variant="ghost"
        size="sm"
        class="w-full justify-start rounded-lg px-2.5 font-normal"
        :disabled="!publicPath"
        @click="copyPublicProfile"
      >
        <HugeiconsIcon :icon="Copy01Icon" :size="17" aria-hidden="true" />
        Copy public profile
      </SharedButton>

      <div class="my-1 h-px bg-border" role="separator" />

      <SharedButton
        as-child
        variant="ghost"
        size="sm"
        class="w-full justify-start rounded-lg px-2.5 font-normal"
      >
        <NuxtLink to="/app/feedback" @click="closeMenu">
          <HugeiconsIcon :icon="Comment01Icon" :size="17" aria-hidden="true" />
          Leave feedback
        </NuxtLink>
      </SharedButton>
      <SharedButton
        variant="ghost"
        size="sm"
        class="w-full justify-start rounded-lg px-2.5 font-normal"
      >
        <HugeiconsIcon :icon="Mail02Icon" :size="17" aria-hidden="true" />
        Contact Us
      </SharedButton>

      <div class="my-1 h-px bg-border" role="separator" />

      <SharedButton
        variant="ghost"
        size="sm"
        class="w-full justify-start rounded-lg px-2.5 font-normal text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/10"
        :loading="signingOut"
        @click="signOut"
      >
        <HugeiconsIcon :icon="Logout01Icon" :size="17" aria-hidden="true" />
        Sign out
      </SharedButton>
    </PopoverContent>
  </Popover>
</template>
