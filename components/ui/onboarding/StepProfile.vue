<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { CheckIcon } from "@hugeicons/core-free-icons";
import { LINK_PREFIX, USERNAME_MAX } from "~/constants/onboarding";
import { normalizeUsername } from "~/helpers/onboarding";
import SharedButton from "~/components/shared/button/Button.vue";
import SharedInput from "~/components/shared/input/Input.vue";
import SharedLabel from "~/components/shared/label/Label.vue";

const ob = useOnboardingContext();

const username = computed({
  get: () => ob.profile.username,
  set: (value) => {
    ob.profile.username = normalizeUsername(String(value));
  },
});
</script>

<template>
  <form class="space-y-6" @submit.prevent="ob.next">
    <div>
      <SharedLabel
        for="username"
        class="mb-1.5 text-[13px] text-muted-foreground"
      >
        Username
      </SharedLabel>
      <SharedInput
        id="username"
        v-model="username"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="yourname"
        :maxlength="USERNAME_MAX"
        class="h-10"
        :loading="ob.usernameStatus === 'checking'"
        :error="
          ob.usernameStatus === 'taken' || ob.usernameStatus === 'invalid'
            ? ob.usernameStatus === 'taken'
              ? 'That username is already taken.'
              : (ob.usernameError ?? undefined)
            : undefined
        "
      >
        <template #prefix>
          <span
            class="flex h-full select-none items-center border-r border-border bg-muted pl-3.5 pr-2.5 text-sm text-muted-foreground"
          >
            {{ LINK_PREFIX }}
          </span>
        </template>
        <template #suffix>
          <HugeiconsIcon
            v-if="ob.usernameStatus === 'available'"
            :icon="CheckIcon"
            :size="16"
            color="currentColor"
            :stroke-width="2.25"
            class="text-emerald-500"
            aria-hidden="true"
          />
        </template>
      </SharedInput>
      <p
        v-if="ob.usernameStatus === 'checking'"
        class="mt-1.5 min-h-4 text-xs text-muted-foreground"
        aria-live="polite"
      >
        Checking availability...
      </p>
    </div>

    <div>
      <SharedLabel for="name" class="mb-1.5 text-[13px] text-muted-foreground">
        Full name
      </SharedLabel>
      <SharedInput
        id="name"
        v-model="ob.profile.name"
        type="text"
        autocomplete="name"
        placeholder="John Doe"
        class="h-10"
      />
    </div>

    <SharedButton
      type="submit"
      :disabled="!ob.canContinue || ob.submitting"
      :loading="ob.submitting"
      class="h-10 w-full"
    >
      Continue
    </SharedButton>
  </form>
</template>
