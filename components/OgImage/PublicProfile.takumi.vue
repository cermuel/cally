<script setup lang="ts">
import {
  ELEMENT_NODE,
  TEXT_NODE,
  parse,
  type ElementNode,
  type Node as HtmlNode,
} from "ultrahtml";
import type { PublicProfileResponse } from "~/utils/api/public";

type RichTextRun = {
  bold?: boolean;
  image?: string;
  link?: boolean;
  text?: string;
};

type RichTextBlock = {
  kind: "paragraph" | "bullet" | "numbered" | "heading" | "blockquote";
  runs: RichTextRun[];
  number?: number;
};

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
const resolveImageUrl = (source: string) =>
  source.startsWith("http") || source.startsWith("data:")
    ? source
    : `${siteUrl}${source.startsWith("/") ? "" : "/"}${source}`;

const collectRuns = (
  node: HtmlNode,
  marks: Pick<RichTextRun, "bold" | "link"> = {},
): RichTextRun[] => {
  if (node.type === TEXT_NODE) {
    const text = node.value.replace(/\s+/g, " ");
    return text ? [{ ...marks, text }] : [];
  }

  if (node.type !== ELEMENT_NODE) return [];

  const element = node as ElementNode;
  if (element.name === "br") return [{ ...marks, text: "\n" }];
  if (element.name === "img" && element.attributes.src) {
    return [{ ...marks, image: element.attributes.src }];
  }

  const nextMarks = {
    bold: marks.bold || ["b", "strong"].includes(element.name),
    link: marks.link || element.name === "a",
  };

  return element.children.flatMap((child) => collectRuns(child, nextMarks));
};

const descriptionBlocks = computed<RichTextBlock[]>(() => {
  if (!profile?.description) return [];

  const document = parse(profile.description);
  const blocks: RichTextBlock[] = [];

  const addElement = (element: ElementNode) => {
    if (element.name === "ul" || element.name === "ol") {
      let number = 0;
      for (const child of element.children) {
        if (child.type !== ELEMENT_NODE || child.name !== "li") continue;
        number += 1;
        blocks.push({
          kind: element.name === "ul" ? "bullet" : "numbered",
          number,
          runs: collectRuns(child),
        });
      }
      return;
    }

    if (["p", "h1", "h2", "h3", "blockquote"].includes(element.name)) {
      const kind = element.name.startsWith("h")
        ? "heading"
        : element.name === "blockquote"
          ? "blockquote"
          : "paragraph";
      blocks.push({ kind, runs: collectRuns(element) });
      return;
    }

    for (const child of element.children) {
      if (child.type === ELEMENT_NODE) addElement(child);
    }
  };

  for (const child of document.children) {
    if (child.type === ELEMENT_NODE) addElement(child);
  }

  return blocks.filter((block) => block.runs.length > 0);
});
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

      <div class="flex min-w-0 flex-col items-start">
        <div class="truncate text-[40px] font-semibold leading-tight">
          {{ profile?.name || props.username || "Cally" }}
        </div>
        <div class="truncate text-[30px] leading-tight text-[#a3a3a3]">
          @{{ profile?.username || props.username }}
        </div>
      </div>
    </div>

    <div
      v-if="descriptionBlocks.length"
      class="relative mt-[46px] flex max-w-[1050px] flex-col overflow-hidden text-[28px] leading-[1.45] text-[#a3a3a3]"
      style="max-height: 286px"
    >
      <div
        v-for="(block, blockIndex) in descriptionBlocks"
        :key="blockIndex"
        class="flex items-start"
        :class="blockIndex === 0 ? '' : 'mt-[14px]'"
      >
        <span
          v-if="block.kind === 'bullet'"
          class="mr-[18px] shrink-0 text-[#555]"
          >•</span
        >
        <span
          v-else-if="block.kind === 'numbered'"
          class="mr-[14px] shrink-0 text-[#777]"
          >{{ block.number }}.</span
        >
        <span
          v-else-if="block.kind === 'blockquote'"
          class="mr-[16px] h-full w-[3px] shrink-0 rounded-full bg-[#555]"
        />

        <div class="flex min-w-0 flex-wrap items-center">
          <template v-for="(run, runIndex) in block.runs" :key="runIndex">
            <img
              v-if="run.image"
              :src="resolveImageUrl(run.image)"
              alt=""
              width="28"
              height="28"
              class="mx-[5px] size-[28px] shrink-0 rounded-md object-cover"
            />
            <span
              v-else
              :class="[
                run.bold || block.kind === 'heading'
                  ? 'font-semibold text-white'
                  : '',
                run.link ? 'text-white underline' : '',
                block.kind === 'blockquote' ? 'italic' : '',
              ]"
              style="white-space: pre-wrap"
              >{{ run.text }}</span
            >
          </template>
        </div>
      </div>
    </div>

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
