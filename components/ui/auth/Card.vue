<script setup lang="ts">
import SharedCardCard from "../../shared/card/Card.vue";
import SharedCardCardContent from "../../shared/card/CardContent.vue";
import SharedCardCardDescription from "../../shared/card/CardDescription.vue";
import SharedCardCardHeader from "../../shared/card/CardHeader.vue";
import SharedCardCardTitle from "../../shared/card/CardTitle.vue";

defineProps<{
  description?: string;
  title: string;
}>();
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground antialiased"
  >
    <div class="w-full max-w-md space-y-6">
      <div class="flex items-center justify-center gap-3">
        <img
          src="/logo.png"
          alt=""
          class="size-9 rounded-md"
          aria-hidden="true"
        />
        <p class="text-lg font-semibold">Cally</p>
      </div>

      <SharedCardCard class="w-full rounded-lg">
        <SharedCardCardHeader class="text-left">
          <SharedCardCardTitle class="text-2xl">
            {{ title }}
          </SharedCardCardTitle>
          <SharedCardCardDescription v-if="description || $slots.description" class="leading-6">
            <slot name="description">
              {{ description }}
            </slot>
          </SharedCardCardDescription>
        </SharedCardCardHeader>
        <SharedCardCardContent>
          <slot />
        </SharedCardCardContent>
      </SharedCardCard>
    </div>
  </main>
</template>
