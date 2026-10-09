<script setup lang="ts">
import {
  Add01Icon,
  Cancel01Icon,
  MailSend01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import type {
  CreateTeamInvitesPayload,
  TeamInviteUser,
} from "~/utils/api/teams";
import { helpers } from "~/utils/helpers";

const props = defineProps<{
  teamName: string;
  sending: boolean;
}>();

const emit = defineEmits<{
  invite: [payload: CreateTeamInvitesPayload];
}>();

const open = defineModel<boolean>("open", { default: false });
const stage = ref<"intro" | "invite">("intro");
const users = ref<TeamInviteUser[]>([{ email: "", role: "member" }]);
const errors = ref<string[]>([]);
const emailInputs = ref<Array<{ focus: () => void } | null>>([]);

const seed = computed(() => props.teamName?.trim() || "new-team");
const avatar = (s: string) =>
  `https://api.dicebear.com/10.x/glass/svg?seed=${encodeURIComponent(s)}`;

watch(open, (isOpen) => {
  if (!isOpen) {
    stage.value = "intro";
    users.value = [{ email: "", role: "member" }];
    errors.value = [];
  }
});

watch(stage, async (s) => {
  if (s !== "invite") return;
  await nextTick();
  emailInputs.value[0]?.focus();
});

const validate = () => {
  const normalizedUsers = users.value.map((user) => ({
    ...user,
    email: user.email.trim().toLowerCase(),
  }));
  const emails = normalizedUsers.map((user) => user.email);
  errors.value = emails.map((email, index) => {
    if (!helpers.validateEmail(email)) return "Enter a valid email address.";
    if (emails.indexOf(email) !== index) return "This email is already added.";
    return "";
  });

  return {
    normalizedUsers,
    firstInvalidIndex: errors.value.findIndex(Boolean),
  };
};

const focusInvalid = async (index: number) => {
  await nextTick();
  emailInputs.value[index]?.focus();
};

const addUser = async () => {
  const { firstInvalidIndex } = validate();
  if (firstInvalidIndex !== -1) {
    await focusInvalid(firstInvalidIndex);
    return;
  }

  users.value.push({ email: "", role: "member" });
  errors.value.push("");
  await nextTick();
  emailInputs.value.at(-1)?.focus();
};

const removeUser = (index: number) => {
  users.value.splice(index, 1);
  errors.value.splice(index, 1);
  if (!users.value.length) users.value.push({ email: "", role: "member" });
};

const send = async () => {
  const { normalizedUsers, firstInvalidIndex } = validate();
  if (firstInvalidIndex !== -1) {
    await focusInvalid(firstInvalidIndex);
    return;
  }

  emit("invite", { users: normalizedUsers });
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-120 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <DialogClose as-child>
          <SharedButton
            variant="ghost"
            size="icon-sm"
            class="absolute end-4 top-4 z-10 text-muted-foreground"
            aria-label="Close invite dialog"
          >
            <HugeiconsIcon
              :icon="Cancel01Icon"
              :size="18"
              :stroke-width="1.75"
              aria-hidden="true"
            />
          </SharedButton>
        </DialogClose>

        <Transition name="invite-stage" mode="out-in">
          <section v-if="stage === 'intro'" key="intro" class="p-6 pt-14">
            <div class="flex justify-center" aria-hidden="true">
              <div class="flex items-center">
                <img
                  v-for="i in 3"
                  :key="i"
                  :src="avatar(`${seed}-${i - 1}`)"
                  alt=""
                  class="stack-item size-14 rounded-full border-[3px] border-card bg-muted"
                  :class="i > 1 && '-ml-3.5'"
                  :style="{ '--i': i - 1 }"
                />
                <span
                  class="stack-item -ml-3.5 flex size-14 items-center justify-center rounded-full border-[1.5px] border-dashed border-muted-foreground/40 bg-card text-muted-foreground"
                  :style="{ '--i': 3 }"
                >
                  <HugeiconsIcon
                    :icon="Add01Icon"
                    :size="20"
                    :stroke-width="1.75"
                  />
                </span>
              </div>
            </div>

            <div class="mx-auto mt-6 max-w-xs text-center">
              <DialogTitle class="text-xl font-semibold tracking-tight">
                Bring your team together
              </DialogTitle>
              <DialogDescription
                class="mt-2 text-sm leading-6 text-muted-foreground"
              >
                Invite the people you work with to {{ teamName }}.
              </DialogDescription>
            </div>

            <SharedButton class="mt-8 h-10 w-full" @click="stage = 'invite'">
              <HugeiconsIcon
                :icon="MailSend01Icon"
                :size="19"
                :stroke-width="1.75"
                aria-hidden="true"
              />
              Send invites
            </SharedButton>
          </section>

          <section v-else key="invite" class="p-6">
            <header class="pe-10">
              <DialogTitle class="text-xl font-semibold tracking-tight">
                Invite people
              </DialogTitle>
              <DialogDescription class="mt-1 text-sm text-muted-foreground">
                They’ll get an email to join {{ teamName }}.
              </DialogDescription>
            </header>

            <div
              class="-mx-1 mt-5 max-h-60 space-y-2.5 overflow-y-auto px-1 py-1"
            >
              <div
                v-for="(user, index) in users"
                :key="index"
                class="flex w-full items-center gap-2.5"
              >
                <SharedAvatar
                  :name="user.email || `Invite ${index + 1}`"
                  class="mt-1 size-8 shrink-0 border border-border"
                />
                <div class="min-w-0 flex-1">
                  <SharedInput
                    :id="`team-invite-${index}`"
                    ref="emailInputs"
                    v-model="user.email"
                    type="email"
                    autocomplete="email"
                    placeholder="hello@example.com"
                    :error="errors[index]"
                    class="h-9 w-full"
                    @update:model-value="errors[index] = ''"
                    @keydown.enter="
                      index === users.length - 1 ? addUser() : undefined
                    "
                  />
                </div>
                <SharedSelect v-model="user.role">
                  <SharedSelectTrigger
                    size="sm"
                    class="h-8! w-28 capitalize"
                    :aria-label="`Role for ${user.email || `invite ${index + 1}`}`"
                  >
                    <SharedSelectValue />
                  </SharedSelectTrigger>
                  <SharedSelectContent>
                    <SharedSelectItem value="member">Member</SharedSelectItem>
                    <SharedSelectItem value="admin">Admin</SharedSelectItem>
                  </SharedSelectContent>
                </SharedSelect>
                <SharedButton
                  v-if="users.length > 1"
                  variant="ghost"
                  size="icon-sm"
                  class="mt-1 shrink-0 text-muted-foreground"
                  :aria-label="`Remove email ${index + 1}`"
                  @click="removeUser(index)"
                >
                  <HugeiconsIcon
                    :icon="Cancel01Icon"
                    :size="16"
                    :stroke-width="1.75"
                    aria-hidden="true"
                  />
                </SharedButton>
              </div>
            </div>

            <SharedButton
              variant="ghost"
              size="sm"
              class="mt-1 -ms-2 text-muted-foreground"
              @click="addUser"
            >
              <HugeiconsIcon
                :icon="Add01Icon"
                :size="16"
                :stroke-width="1.75"
                aria-hidden="true"
              />
              Add another
            </SharedButton>

            <SharedButton
              class="mt-6 h-10 w-full"
              :loading="sending"
              @click="send"
            >
              Send {{ users.length === 1 ? "invite" : "invites" }}
            </SharedButton>
          </section>
        </Transition>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.invite-stage-enter-active,
.invite-stage-leave-active {
  transition:
    opacity 160ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.invite-stage-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}

.invite-stage-leave-to {
  opacity: 0;
  transform: translateX(-0.75rem);
}

.stack-item {
  animation: stack-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  animation-delay: calc(var(--i) * 60ms);
}

@keyframes stack-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .invite-stage-enter-active,
  .invite-stage-leave-active {
    transition-duration: 1ms;
  }

  .stack-item {
    animation: none;
  }
}
</style>
