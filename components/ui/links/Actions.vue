<script setup lang="ts">
import {
  Copy01Icon,
  CopyLinkIcon,
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import type { Link } from '~/utils/api/links'

const props = defineProps<{
  link: Link
  publicUrl: string
}>()

const emit = defineEmits<{
  delete: [link: Link]
  duplicate: [link: Link]
}>()

const open = ref(false)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.publicUrl)
    toast.success('Link copied')
  } catch {
    toast.error('Could not copy the link')
  }
  open.value = false
}

const openPublicLink = () => {
  window.open(props.publicUrl, '_blank', 'noopener,noreferrer')
  open.value = false
}
</script>

<template>
  <SharedPopover v-model:open="open">
    <SharedPopoverTrigger as-child>
      <SharedButton type="button" variant="ghost" size="icon-sm" :aria-label="`Actions for ${link.name}`">
        <HugeiconsIcon :icon="MoreHorizontalIcon" :size="18" :stroke-width="1.75" aria-hidden="true" />
      </SharedButton>
    </SharedPopoverTrigger>
    <SharedPopoverContent align="end" class="w-48 p-1.5">
      <NuxtLink
        :to="`/app/links/${link.id}`"
        class="flex h-8 items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        @click="open = false"
      >
        <HugeiconsIcon :icon="Edit02Icon" :size="16" :stroke-width="1.5" aria-hidden="true" />
        Edit
      </NuxtLink>
      <button
        type="button"
        class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        @click="emit('duplicate', link); open = false"
      >
        <HugeiconsIcon :icon="Copy01Icon" :size="16" :stroke-width="1.5" aria-hidden="true" />
        Duplicate
      </button>
      <button
        type="button"
        class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        @click="openPublicLink"
      >
        <HugeiconsIcon :icon="ViewIcon" :size="16" :stroke-width="1.5" aria-hidden="true" />
        View link
      </button>
      <button
        type="button"
        class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        @click="copyLink"
      >
        <HugeiconsIcon :icon="CopyLinkIcon" :size="16" :stroke-width="1.5" aria-hidden="true" />
        Copy link
      </button>
      <div class="my-1 h-px bg-border" role="separator" />
      <button
        type="button"
        class="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-sm text-destructive outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-destructive"
        @click="emit('delete', link); open = false"
      >
        <HugeiconsIcon :icon="Delete02Icon" :size="16" :stroke-width="1.5" aria-hidden="true" />
        Delete
      </button>
    </SharedPopoverContent>
  </SharedPopover>
</template>
