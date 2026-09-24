<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { STEPS } from "~/constants/onboarding";
import { ONBOARDING_KEY } from "~/composables/useOnboarding";
import SharedButton from "~/components/shared/button/Button.vue";

definePageMeta({ layout: false });
useHead({ title: "Get started" });

const ob = useOnboarding();
const auth = useAuth();
provide(ONBOARDING_KEY, ob);

const signOut = async () => {
  auth.clearAuth();
  await navigateTo("/auth/login");
};
</script>

<template>
  <main
    class="h-dvh w-dvw bg-background p-3 text-foreground antialiased sm:p-6"
  >
    <div
      class="h-full w-full flex rounded-xl border border-border bg-card overflow-hidden"
    >
      <UiOnboardingArt class="hidden flex-1 lg:flex" />
      <section
        class="flex min-w-0 lg:w-150 flex-col overflow-hidden max-lg:flex-1"
      >
        <header
          class="flex items-center justify-between gap-4 px-6 pt-6 sm:px-10 sm:pt-8"
        >
          <div class="flex items-center gap-3">
            <UiOnboardingProgress
              :current="ob.stepIndex"
              :total="STEPS.length"
            />
            <h1 class="text-lg font-medium tracking-tight text-foreground">
              {{ ob.step.title }}
            </h1>
          </div>
          <SharedButton
            type="button"
            variant="outline"
            size="sm"
            @click="signOut"
          >
            <HugeiconsIcon :icon="Logout01Icon" :size="15" />
            Sign out
          </SharedButton>
        </header>

        <div
          class="flex flex-1 items-center justify-center px-6 py-10 sm:px-10"
        >
          <div
            class="w-full transition-[max-width] overflow-hidden duration-300"
            :class="ob.step.id === 'availability' ? 'max-w-xl' : 'max-w-sm'"
          >
            <Transition
              :name="ob.direction === 1 ? 'step-forward' : 'step-back'"
              mode="out-in"
            >
              <UiOnboardingStepProfile v-if="ob.step.id === 'profile'" />
              <UiOnboardingStepCalendar v-else-if="ob.step.id === 'calendar'" />
              <UiOnboardingStepAvailability v-else />
            </Transition>
          </div>
        </div>
        <div class="h-10" />
      </section>
    </div>
  </main>
</template>

<style scoped>
.step-forward-enter-active,
.step-forward-leave-active,
.step-back-enter-active,
.step-back-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.step-forward-enter-from,
.step-back-leave-to {
  opacity: 0;
  transform: translateX(14px);
}
.step-forward-leave-to,
.step-back-enter-from {
  opacity: 0;
  transform: translateX(-14px);
}
@media (prefers-reduced-motion: reduce) {
  .step-forward-enter-active,
  .step-forward-leave-active,
  .step-back-enter-active,
  .step-back-leave-active {
    transition: none;
  }
}
</style>
