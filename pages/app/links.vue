<script setup lang="ts">
import {
  ListFilterIcon,
  PlusSignIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { LinkListView } from "~/types/links";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import {
  linksApi,
  type CreateLinkPayload,
  type Link,
  type UpdateLinkPayload,
} from "~/utils/api/links";
import { queryKeys } from "~/utils/api/query-keys";
import { getDuplicateName, getDuplicateSlug } from "~/utils/links";

definePageMeta({ layout: false });
useHead({ title: "Links | Cally" });

const auth = useAuth();
const client = useApiClient();
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const linksQuery = useLinks();
const createOpen = ref(false);
const createErrors = ref<Record<string, string[]>>({});
const deleteTarget = ref<Link | null>(null);
const deleteOpen = ref(false);
const updatingId = ref<number | null>(null);
const selectedLink = ref<Link | null>(null);
const editOpen = ref(false);
const editErrors = ref<Record<string, string[]>>({});
const desktopLinkView = ref<LinkListView>("ticket");
const isMobile = ref(true);
const linkedLinkId = computed(() => {
  const value = route.query.link_id;
  const rawId = Array.isArray(value) ? value[0] : value;
  if (!rawId || !/^\d+$/.test(rawId)) return null;

  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
});
const linkedLinkQuery = useQuery({
  queryKey: computed(() =>
    queryKeys.links.detail(linkedLinkId.value ?? "none"),
  ),
  enabled: computed(() => linkedLinkId.value !== null),
  queryFn: () => linksApi.get(client, linkedLinkId.value!),
});

const linkView = computed<LinkListView>(() =>
  isMobile.value ? "table" : desktopLinkView.value,
);

let mobileQuery: MediaQueryList | undefined;

const updateMobileView = (event?: MediaQueryListEvent) => {
  isMobile.value = event?.matches ?? mobileQuery?.matches ?? true;
};

onMounted(() => {
  mobileQuery = window.matchMedia("(max-width: 39.999rem)");
  updateMobileView();
  mobileQuery.addEventListener("change", updateMobileView);
});

onBeforeUnmount(() => {
  mobileQuery?.removeEventListener("change", updateMobileView);
});

const links = computed(() => linksQuery.data.value?.links ?? []);

const createMutation = useMutation({
  mutationFn: (payload: CreateLinkPayload) => linksApi.create(client, payload),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.links.all() });
    createOpen.value = false;
    createErrors.value = {};
    toast.success("Link created");
  },
  onError: (error) => {
    createErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not create the link."));
  },
});

const deleteMutation = useMutation({
  mutationFn: (id: number) => linksApi.remove(client, id),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.links.all() });
    deleteOpen.value = false;
    editOpen.value = false;
    deleteTarget.value = null;
    selectedLink.value = null;
    void closeLinkedLink();
    toast.success("Link deleted");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete the link.")),
});

const duplicateMutation = useMutation({
  mutationFn: (link: Link) =>
    linksApi.create(client, {
      name: getDuplicateName(link.name),
      slug: getDuplicateSlug(link, links.value),
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

const requestDelete = (link: Link) => {
  deleteTarget.value = link;
  deleteOpen.value = true;
};

const openLink = (link: Link) => {
  queryClient.setQueryData(queryKeys.links.detail(link.id), {
    message: "",
    link,
  });
  editErrors.value = {};
  void router.push({
    query: {
      ...route.query,
      link_id: String(link.id),
    },
  });
};

const closeLinkedLink = () =>
  router.replace({
    query: {
      ...route.query,
      link_id: undefined,
    },
  });

const setEditOpen = (open: boolean) => {
  editOpen.value = open;
  if (open || linkedLinkId.value === null) return;
  selectedLink.value = null;
  editErrors.value = {};
  void closeLinkedLink();
};

watch(
  [linkedLinkId, () => linkedLinkQuery.data.value?.link],
  ([linkId, link]) => {
    selectedLink.value = link?.id === linkId ? link : null;
    editOpen.value = link?.id === linkId;
  },
  { immediate: true },
);

watch(
  () => linkedLinkQuery.error.value,
  (error) => {
    if (error) toast.error(getApiErrorMessage(error, "Could not load the link."));
  },
);

const editMutation = useMutation({
  mutationFn: (payload: UpdateLinkPayload) => {
    if (!selectedLink.value) throw new Error("No link selected");
    return linksApi.update(client, selectedLink.value.id, payload);
  },
  onSuccess: async (response) => {
    queryClient.setQueryData(
      queryKeys.links.detail(response.link.id),
      response,
    );
    await queryClient.invalidateQueries({ queryKey: queryKeys.links.all() });
    editOpen.value = false;
    selectedLink.value = null;
    editErrors.value = {};
    void closeLinkedLink();
    toast.success("Link updated");
  },
  onError: (error) => {
    editErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not update the link."));
  },
});

const updateMutation = useMutation({
  mutationFn: ({
    link,
    visibility,
  }: {
    link: Link;
    visibility: Link["visibility"];
  }) => {
    updatingId.value = link.id;
    return linksApi.update(client, link.id, { visibility });
  },
  onSuccess: async (response) => {
    queryClient.setQueryData(
      queryKeys.links.detail(response.link.id),
      response,
    );
    await queryClient.invalidateQueries({ queryKey: queryKeys.links.all() });
  },
  onSettled: () => {
    updatingId.value = null;
  },
});

const updateVisibility = (link: Link, visibility: Link["visibility"]) => {
  toast.promise(updateMutation.mutateAsync({ link, visibility }), {
    loading: "Updating visibility...",
    success: "Visibility updated",
    error: (error: any) =>
      getApiErrorMessage(error, "Could not update visibility."),
  });
};
</script>

<template>
  <UiAppShell>
    <div class="mb-8 flex items-center justify-between gap-4 relative">
      <UiAppPageHeader
        title="Links"
        description="Create and manage the booking links you share with guests."
        class="mb-0"
      />
      <div class="mt-1 flex items-center gap-2 max-sm:absolute -top-1 right-0">
        <SharedTabs v-model="desktopLinkView" class="hidden sm:flex">
          <SharedTabsList aria-label="Link view">
            <SharedTabsTrigger value="ticket" aria-label="Ticket view">
              <HugeiconsIcon
                :icon="Ticket01Icon"
                :size="16"
                :stroke-width="1.75"
                aria-hidden="true"
              />
              <span class="sr-only">Ticket view</span>
            </SharedTabsTrigger>
            <SharedTabsTrigger value="table" aria-label="List view">
              <HugeiconsIcon
                :icon="ListFilterIcon"
                :size="16"
                :stroke-width="1.75"
                aria-hidden="true"
              />
              <span class="sr-only">List view</span>
            </SharedTabsTrigger>
          </SharedTabsList>
        </SharedTabs>

        <SharedButton
          v-if="!createOpen"
          type="button"
          @click="createOpen = true"
        >
          <HugeiconsIcon
            :icon="PlusSignIcon"
            :size="16"
            :stroke-width="2"
            aria-hidden="true"
          />
          <span class="hidden sm:inline">Create link</span>
          <span class="sm:hidden">Create</span>
        </SharedButton>
      </div>
    </div>

    <UiLinksCreateCard
      v-model:open="createOpen"
      :username="auth.user.value?.username"
      :submitting="createMutation.isPending.value"
      :errors="createErrors"
      @cancel="createOpen = false"
      @submit="createMutation.mutate($event)"
    />

    <div
      v-if="linksQuery.isError.value"
      role="alert"
      class="mb-4 flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
    >
      <p class="text-sm text-destructive">
        {{
          getApiErrorMessage(
            linksQuery.error.value,
            "Could not load your links.",
          )
        }}
      </p>
      <SharedButton
        type="button"
        variant="outline"
        size="sm"
        @click="linksQuery.refetch()"
      >
        Try again
      </SharedButton>
    </div>

    <UiLinksList
      :links="links"
      :username="auth.user.value?.username"
      :loading="linksQuery.isPending.value"
      :updating-id="updatingId"
      :view="linkView"
      @create="createOpen = true"
      @delete="requestDelete"
      @duplicate="duplicateMutation.mutate($event)"
      @open="openLink"
      @visibility="updateVisibility"
    />

    <UiLinksEditSheet
      :open="editOpen"
      :link="selectedLink"
      :username="auth.user.value?.username"
      :saving="editMutation.isPending.value"
      :deleting="deleteMutation.isPending.value"
      :errors="editErrors"
      @update:open="setEditOpen"
      @delete="requestDelete"
      @save="editMutation.mutate($event)"
    />

    <UiLinksDeleteDialog
      v-model:open="deleteOpen"
      :link="deleteTarget"
      :deleting="deleteMutation.isPending.value"
      @confirm="deleteTarget && deleteMutation.mutate(deleteTarget.id)"
    />
  </UiAppShell>
</template>
