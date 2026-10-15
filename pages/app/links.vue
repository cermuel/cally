<script setup lang="ts">
import {
  ListFilterIcon,
  PlusSignIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { LinkListView } from "~/types/links";
import { getApiErrorMessage } from "~/utils/api/client";
import { linksApi, type Link } from "~/utils/api/links";
import { queryKeys } from "~/utils/api/query-keys";

definePageMeta({ layout: false });
useHead({ title: "Links" });

const auth = useAuth();
const client = useApiClient();
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const linksQuery = useLinks();
const createOpen = ref(false);
const deleteTarget = ref<Link | null>(null);
const deleteOpen = ref(false);
const selectedLink = ref<Link | null>(null);
const editOpen = ref(false);
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

const requestDelete = (link: Link) => {
  deleteTarget.value = link;
  deleteOpen.value = true;
};

const openLink = (link: Link) => {
  queryClient.setQueryData(queryKeys.links.detail(link.id), {
    message: "",
    link,
  });
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
    if (error)
      toast.error(getApiErrorMessage(error, "Could not load the link."));
  },
);

const handleDeleted = () => {
  editOpen.value = false;
  deleteTarget.value = null;
  selectedLink.value = null;
  void closeLinkedLink();
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
      :view="linkView"
      @create="createOpen = true"
      @delete="requestDelete"
      @open="openLink"
    />

    <UiLinksEditSheet
      :open="editOpen"
      :link="selectedLink"
      :username="auth.user.value?.username"
      @update:open="setEditOpen"
      @delete="requestDelete"
    />

    <UiLinksDeleteDialog
      v-model:open="deleteOpen"
      :link="deleteTarget"
      @deleted="handleDeleted"
    />
  </UiAppShell>
</template>
