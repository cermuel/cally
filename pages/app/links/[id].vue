<script setup lang="ts">
import { ArrowLeft02Icon, CopyLinkIcon, Link01Icon, ViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { getApiErrorMessage, getApiFieldErrors } from '~/utils/api/client'
import { linksApi, type UpdateLinkPayload } from '~/utils/api/links'
import { queryKeys } from '~/utils/api/query-keys'
import { getPublicLinkUrl } from '~/utils/links'

definePageMeta({ layout: false })

const route = useRoute()
const auth = useAuth()
const client = useApiClient()
const queryClient = useQueryClient()
const linkId = computed(() => Number(route.params.id))

const linkQuery = useQuery({
  queryKey: computed(() => queryKeys.links.detail(linkId.value)),
  queryFn: () => linksApi.get(client, linkId.value),
  enabled: computed(() => Number.isInteger(linkId.value) && linkId.value > 0),
  staleTime: 30 * 60 * 1000,
})

const link = computed(() => linkQuery.data.value?.link)
const breadcrumb = useBreadcrumb()
const updateErrors = ref<Record<string, string[]>>({})
const publicUrl = computed(() => link.value
  ? getPublicLinkUrl(auth.user.value?.username, link.value.slug)
  : '')

useHead(() => ({ title: link.value ? `${link.value.name} | Cally` : 'Link | Cally' }))

watch(link, currentLink => {
  breadcrumb.setItems([
    { title: 'Links', route: '/app/links', icon: Link01Icon },
    { title: currentLink?.name ?? 'Link' },
  ])
}, { immediate: true })

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(publicUrl.value)
    toast.success('Link copied')
  } catch {
    toast.error('Could not copy the link')
  }
}

const updateMutation = useMutation({
  mutationFn: (payload: UpdateLinkPayload) => linksApi.update(client, linkId.value, payload),
  onSuccess: async response => {
    queryClient.setQueryData(queryKeys.links.detail(linkId.value), response)
    await queryClient.invalidateQueries({ queryKey: queryKeys.links.all() })
    updateErrors.value = {}
  },
  onError: error => {
    updateErrors.value = getApiFieldErrors(error)
  },
})

const updateLink = (payload: UpdateLinkPayload) => {
  updateErrors.value = {}
  toast.promise(updateMutation.mutateAsync(payload), {
    loading: 'Updating link...',
    success: 'Link updated',
    error: error => getApiErrorMessage(error, 'Could not update the link.'),
  })
}
</script>

<template>
  <UiAppShell>
    <NuxtLink
      to="/app/links"
      class="mb-5 inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <HugeiconsIcon :icon="ArrowLeft02Icon" :size="16" :stroke-width="1.75" aria-hidden="true" />
      Back to links
    </NuxtLink>

    <div v-if="link" class="mb-8 flex items-start justify-between gap-4">
      <UiAppPageHeader :title="link.name" description="Manage this booking link and preview what guests will open." class="mb-0" />
      <div class="flex gap-2">
        <SharedButton type="button" variant="outline" size="icon" aria-label="Copy public link" @click="copyLink">
          <HugeiconsIcon :icon="CopyLinkIcon" :size="17" :stroke-width="1.75" aria-hidden="true" />
        </SharedButton>
        <SharedButton as="a" :href="publicUrl" target="_blank" rel="noopener noreferrer">
          <HugeiconsIcon :icon="ViewIcon" :size="17" :stroke-width="1.75" aria-hidden="true" />
          <span class="hidden sm:inline">View link</span>
        </SharedButton>
      </div>
    </div>

    <div v-if="linkQuery.isPending.value" class="space-y-4" aria-label="Loading link" aria-busy="true">
      <div class="h-8 w-48 animate-pulse rounded bg-muted" />
      <div class="h-96 animate-pulse rounded-xl bg-muted" />
    </div>

    <div v-else-if="linkQuery.isError.value" role="alert" class="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <h1 class="font-semibold text-destructive">Could not load this link</h1>
      <p class="mt-1 text-sm text-muted-foreground">{{ getApiErrorMessage(linkQuery.error.value, 'The link may no longer exist.') }}</p>
      <SharedButton type="button" variant="outline" class="mt-4" @click="linkQuery.refetch()">Try again</SharedButton>
    </div>

    <UiLinksDetailsForm
      v-else-if="link"
      :link="link"
      :username="auth.user.value?.username"
      :saving="updateMutation.isPending.value"
      :errors="updateErrors"
      @save="updateLink"
    />
  </UiAppShell>
</template>
