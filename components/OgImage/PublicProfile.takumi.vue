<script setup lang="ts">
import type { PublicProfileResponse } from "~/utils/api/public";

const props = withDefaults(
  defineProps<{
    username?: string;
  }>(),
  { username: "" },
);

const config = useRuntimeConfig();
const configuredApiBase = String(config.public.apiBaseUrl || "").replace(
  /\/$/,
  "",
);
const profileEndpoint = configuredApiBase
  ? `${configuredApiBase}/api/public/profile`
  : "/api/public/profile";

let profileResponse: PublicProfileResponse | null = null;
try {
  profileResponse = await $fetch<PublicProfileResponse>(profileEndpoint, {
    query: { username: props.username },
  });
} catch {
  profileResponse = null;
}

const profile = profileResponse?.user;
const siteUrl = "https://cally.cermuel.dev";
const avatarUrl = profile?.avatar
  ? profile.avatar.startsWith("http")
    ? profile.avatar
    : `${siteUrl}${profile.avatar.startsWith("/") ? "" : "/"}${profile.avatar}`
  : "";
const avatarFallbackUrl = `https://api.dicebear.com/10.x/glass/svg?seed=${encodeURIComponent(profile?.name || props.username || "Cally")}`;
</script>

<template>
  <div
    class="relative flex h-full w-full flex-col overflow-hidden bg-[#0a0a0a] px-[60px] py-[42px] text-white"
    style="font-family: Geist, sans-serif"
  >
    <div
      class="absolute inset-0 opacity-60"
      style="
        background-image: radial-gradient(circle, #303030 2px, transparent 2px);
        background-size: 40px 40px;
      "
    />

    <div class="relative flex items-center gap-8">
      <div
        class="flex size-[112px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#252525] text-[48px] font-semibold text-[#a3a3a3]"
      >
        <img
          :src="avatarUrl || avatarFallbackUrl"
          alt=""
          width="112"
          height="112"
          class="size-full object-cover"
        />
      </div>

      <div class="min-w-0">
        <div class="truncate text-[48px] font-semibold leading-tight">
          {{ profile?.name || props.username || "Cally" }}
        </div>
        <div class="mt-2 truncate text-[30px] text-[#a3a3a3]">
          @{{ profile?.username || props.username }}
        </div>
      </div>
    </div>

    <div
      v-if="profile?.description"
      class="relative mt-[46px] max-w-[1050px] overflow-hidden text-[28px] leading-[1.45] text-[#a3a3a3]"
      style="
        display: -webkit-box;
        max-height: 286px;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 7;
      "
      v-html="profile.description"
    />

    <div
      class="relative mt-auto flex items-center gap-3 text-[24px] text-[#a3a3a3]"
    >
      <img
        :src="`${siteUrl}/logo.png`"
        alt=""
        width="38"
        height="38"
        class="size-[38px] rounded-lg"
      />
      <span
        >Powered by<strong class="font-semibold text-white">
          {{ " " }} Cally</strong
        ></span
      >
    </div>
  </div>
</template>
