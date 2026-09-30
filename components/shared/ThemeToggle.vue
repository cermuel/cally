<script setup lang="ts">
import { Sun01Icon, SunMoonIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const { theme, toggleTheme } = useTheme();

const nextThemeLabel = computed(() =>
  theme.value === "dark" ? "Switch to light mode" : "Switch to dark mode",
);
</script>

<template>
  <SharedButton
    variant="ghost"
    size="icon-sm"
    class="h-8 w-8"
    :aria-label="nextThemeLabel"
    :title="nextThemeLabel"
    @click="toggleTheme"
  >
    <HugeiconsIcon
      :icon="theme === 'dark' ? Sun01Icon : SunMoonIcon"
      :stroke-width="1.75"
      aria-hidden="true"
    />
  </SharedButton>
</template>
