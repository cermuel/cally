<script setup lang="ts">
import { Sun01Icon, SunMoonIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const { initTheme, theme, toggleTheme } = useTheme();

const nextThemeLabel = computed(() =>
  theme.value === "dark" ? "Switch to light mode" : "Switch to dark mode",
);

onMounted(initTheme);
</script>

<template>
  <SharedButton
    variant="ghost"
    size="icon-sm"
    class="ml-auto -mr-2 h-7 w-7"
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
