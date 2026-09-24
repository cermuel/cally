<script setup lang="ts">
import {
  ArrowLeft01Icon,
  CheckIcon,
  MailCheckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import SharedButton from "../../shared/button/Button.vue";

const props = defineProps<{
  email: string;
  resending?: boolean;
}>();

const emit = defineEmits<{
  resend: [];
  useDifferentEmail: [];
}>();

const emailProviders = [
  {
    key: "gmail",
    name: "Gmail",
    url: "https://mail.google.com/",
    logo: "gmail",
    domains: ["gmail.com", "googlemail.com"],
  },
  {
    key: "yahoo",
    name: "Yahoo Mail",
    url: "https://mail.yahoo.com/",
    logo: "yahoo",
    domains: ["yahoo.com", "ymail.com", "rocketmail.com"],
  },
  {
    key: "outlook",
    name: "Outlook",
    url: "https://outlook.live.com/mail/",
    logo: "outlook",
    domains: ["outlook.com", "hotmail.com", "live.com", "msn.com"],
  },
];

const emailDomain = computed(() => {
  return props.email.split("@")[1]?.toLowerCase() ?? "";
});

const suggestedProvider = computed(() => {
  return emailProviders.find((provider) =>
    provider.domains.includes(emailDomain.value),
  );
});

const sortedEmailProviders = computed(() => {
  if (!suggestedProvider.value) {
    return emailProviders;
  }

  return [
    suggestedProvider.value,
    ...emailProviders.filter(
      (provider) => provider.key !== suggestedProvider.value?.key,
    ),
  ];
});
</script>

<template>
  <div class="space-y-6">
    <div
      class="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1"
    >
      <div class="flex items-center justify-around gap-5">
        <a
          v-for="provider in sortedEmailProviders"
          :key="provider.key"
          :href="provider.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative flex size-[5.4rem] items-center justify-center rounded-md transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-95"
          :class="provider.key === suggestedProvider?.key && 'scale-105'"
          :aria-label="`Open ${provider.name}`"
          :title="provider.name"
        >
          <span class="sr-only">{{ provider.name }}</span>
          <span
            class="flex size-[4.95rem] items-center justify-center transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            <svg
              v-if="provider.logo === 'gmail'"
              viewBox="0 0 48 48"
              class="size-[4.5rem]"
            >
              <path
                fill="#4285f4"
                d="M43 39H35V18.6L24 27L13 18.6V39H5V9H13L24 17.4L35 9H43V39Z"
              />
              <path fill="#34a853" d="M5 9L13 15V39H5V9Z" />
              <path fill="#fbbc04" d="M35 15L43 9V39H35V15Z" />
              <path fill="#ea4335" d="M13 9L24 17.4L35 9H43L24 23.5L5 9H13Z" />
            </svg>
            <svg
              v-else-if="provider.logo === 'yahoo'"
              viewBox="0 0 48 48"
              class="size-[4.5rem]"
            >
              <rect width="48" height="48" rx="10" fill="#6001d2" />
              <path
                fill="#fff"
                d="M19.2 29.1L12.2 16H18L22.1 24.2L26.1 16H31.7L24.6 29.1V36H19.2V29.1Z"
              />
              <path
                fill="#fff"
                d="M31.7 15.7H36.8L35.4 30.6H30.3L31.7 15.7ZM29.8 33.1H35.2L34.7 37.8H29.3L29.8 33.1Z"
              />
            </svg>
            <svg v-else viewBox="0 0 48 48" class="size-[4.5rem]">
              <rect x="4" y="9" width="25" height="30" rx="3" fill="#0078d4" />
              <path
                fill="#fff"
                d="M16.4 30.6C12.6 30.6 10 27.7 10 24C10 20.2 12.7 17.4 16.5 17.4C20.3 17.4 22.9 20.2 22.9 23.9C22.9 27.7 20.2 30.6 16.4 30.6ZM16.5 27.4C18.2 27.4 19.1 26.1 19.1 24C19.1 21.9 18.1 20.6 16.5 20.6C14.8 20.6 13.8 21.9 13.8 24C13.8 26.1 14.8 27.4 16.5 27.4Z"
              />
              <path fill="#50a5f1" d="M29 14H44V34H29V14Z" />
              <path fill="#0a5eb7" d="M29 14H44L36.5 24.5L29 14Z" />
              <path fill="#0b78d0" d="M29 34L36.5 24.5L44 34H29Z" />
            </svg>
          </span>
          <span
            v-if="provider.key === suggestedProvider?.key"
            class="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_2px_hsl(var(--card))]"
            aria-hidden="true"
          >
            <HugeiconsIcon
              :icon="CheckIcon"
              :size="16"
              color="currentColor"
              :stroke-width="2.5"
            />
          </span>
        </a>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <SharedButton
        type="button"
        class="w-full"
        :loading="resending"
        @click="emit('resend')"
      >
        <HugeiconsIcon
          :icon="MailCheckIcon"
          :size="16"
          color="currentColor"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        Resend email
      </SharedButton>

      <SharedButton
        type="button"
        variant="outline"
        class="w-full"
        @click="emit('useDifferentEmail')"
      >
        <HugeiconsIcon
          :icon="ArrowLeft01Icon"
          :size="16"
          color="currentColor"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        Use a different email
      </SharedButton>
    </div>
  </div>
</template>
