<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Profile | Cally' })

const auth = useAuth()

const publicPath = computed(() =>
  auth.user.value?.username ? `/${auth.user.value.username}` : null,
)
</script>

<template>
  <UiAppShell>
    <UiAppPageHeader
      title="Profile"
      description="Manage the public details guests see before they book with you."
    />

    <section class="rounded-lg border border-border bg-card p-6 shadow-xs">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-4">
          <div>
            <p class="text-sm text-muted-foreground">Name</p>
            <p class="mt-1 font-medium">{{ auth.user.value?.name || 'Not set' }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Username</p>
            <p class="mt-1 font-medium">
              {{ auth.user.value?.username ? `@${auth.user.value.username}` : 'Not set' }}
            </p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Timezone</p>
            <p class="mt-1 font-medium">{{ auth.user.value?.timezone || 'Not set' }}</p>
          </div>
        </div>

        <NuxtLink
          v-if="publicPath"
          :to="publicPath"
          class="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent"
        >
          View public page
        </NuxtLink>
      </div>
    </section>
  </UiAppShell>
</template>
