<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { LinkListView } from "~/types/links";
import { getApiErrorMessage } from "~/utils/api/client";
import { linksApi, type Link } from "~/utils/api/links";
import { queryKeys } from "~/utils/api/query-keys";
import {
  getDuplicateName,
  getDuplicateSlug,
  getPublicLinkLabel,
  getPublicLinkUrl,
} from "~/utils/links";

const props = defineProps<{
  links: Link[];
  username?: string | null;
  loading: boolean;
  view: LinkListView;
}>();

const emit = defineEmits<{
  create: [];
  delete: [link: Link];
  open: [link: Link];
}>();

const client = useApiClient();
const queryClient = useQueryClient();
const updatingId = ref<number | null>(null);

const duplicateMutation = useMutation({
  mutationFn: (link: Link) =>
    linksApi.create(client, {
      name: getDuplicateName(link.name),
      slug: getDuplicateSlug(link, props.links),
      duration_minutes: link.duration_minutes,
      description: link.description,
      color: link.color,
      status: "draft",
      visibility: link.visibility,
    }),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.links.all() });
    toast.success("Link duplicated as a draft");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not duplicate the link.")),
});

const visibilityMutation = useMutation({
  mutationFn: ({ link, visibility }: { link: Link; visibility: Link["visibility"] }) => {
    updatingId.value = link.id;
    return linksApi.update(client, link.id, { visibility });
  },
  onSuccess: async (response) => {
    queryClient.setQueryData(queryKeys.links.detail(response.link.id), response);
    await queryClient.invalidateQueries({ queryKey: queryKeys.links.all() });
  },
  onSettled: () => {
    updatingId.value = null;
  },
});

const updateVisibility = (link: Link, visibility: Link["visibility"]) => {
  toast.promise(visibilityMutation.mutateAsync({ link, visibility }), {
    loading: "Updating visibility...",
    success: "Visibility updated",
    error: (error: unknown) =>
      getApiErrorMessage(error, "Could not update visibility."),
  });
};
</script>

<template>
  <section
    class="overflow-hidden rounded-xl"
    aria-labelledby="links-list-heading"
  >
    <div
      v-if="loading"
      class="divide-y divide-border"
      aria-label="Loading links"
      aria-busy="true"
    >
      <div
        v-for="index in 3"
        :key="index"
        class="flex items-center gap-4 px-5 py-4"
      >
        <div class="size-10 animate-pulse rounded-lg bg-muted" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-36 animate-pulse rounded bg-muted" />
          <div class="h-3 w-56 max-w-full animate-pulse rounded bg-muted" />
        </div>
        <div class="h-5 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    </div>

    <TransitionGroup
      v-else
      name="link-list"
      tag="div"
      class="relative space-y-2 px-1"
    >
      <UiLinksListItem
        v-for="link in links"
        :key="link.id"
        :link="link"
        :public-label="getPublicLinkLabel(username, link.slug)"
        :public-url="getPublicLinkUrl(username, link.slug)"
        :updating="updatingId === link.id"
        :view="view"
        @delete="emit('delete', $event)"
        @duplicate="duplicateMutation.mutate($event)"
        @open="emit('open', $event)"
        @visibility="updateVisibility"
      />

      <div
        v-if="!links.length"
        key="empty"
        class="flex flex-col items-center px-6 py-14 text-center"
      >
        <h2 class="font-semibold">Create your first booking link</h2>
        <p class="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          Give guests a focused way to book a meeting with you.
        </p>
        <SharedButton type="button" class="mt-5" @click="emit('create')">
          Create link
        </SharedButton>
      </div>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.link-list-enter-active,
.link-list-leave-active {
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}

.link-list-enter-from,
.link-list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.link-list-leave-active {
  position: absolute;
  width: calc(100% - 0.5rem);
}

.link-list-move {
  transition: transform 200ms var(--ease-in-out);
}

@media (prefers-reduced-motion: reduce) {
  .link-list-enter-active,
  .link-list-leave-active {
    transition: opacity 150ms var(--ease-out);
  }

  .link-list-enter-from,
  .link-list-leave-to {
    transform: none;
  }

  .link-list-move {
    transition: none;
  }
}
</style>
