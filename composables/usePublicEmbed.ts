type PublicEmbedTheme = "auto" | "light" | "dark";
type PublicEmbedView = "profile" | "event";
type PublicEmbedMode = "inline" | "popup";

export function usePublicEmbed(view: PublicEmbedView) {
  const route = useRoute();
  const root = ref<HTMLElement | null>(null);
  const isEmbed = computed(() =>
    ["true", "1"].includes(String(route.query.embed)),
  );
  const theme = computed<PublicEmbedTheme>(() => {
    const value = String(route.query.theme);
    return value === "light" || value === "dark" ? value : "auto";
  });
  const mode = computed<PublicEmbedMode>(() =>
    route.query.mode === "popup" ? "popup" : "inline",
  );

  let resizeObserver: ResizeObserver | undefined;
  let colorScheme: MediaQueryList | undefined;
  let removeColorSchemeListener: (() => void) | undefined;

  const applyTheme = () => {
    if (!isEmbed.value) return;

    colorScheme ??= window.matchMedia("(prefers-color-scheme: dark)");
    document.documentElement.classList.toggle(
      "dark",
      theme.value === "dark" ||
        (theme.value === "auto" && colorScheme.matches),
    );
    document.documentElement.style.colorScheme =
      theme.value === "auto" ? "light dark" : theme.value;
  };

  onMounted(() => {
    if (!isEmbed.value) return;

    applyTheme();
    colorScheme ??= window.matchMedia("(prefers-color-scheme: dark)");
    const handleColorSchemeChange = () => {
      if (theme.value === "auto") applyTheme();
    };
    colorScheme.addEventListener("change", handleColorSchemeChange);
    removeColorSchemeListener = () =>
      colorScheme?.removeEventListener("change", handleColorSchemeChange);

    if (window.parent === window || !root.value) return;

    const element = root.value;
    const postHeight = () =>
      window.parent.postMessage(
        {
          source: "cally",
          type: "resize",
          height: element.offsetHeight,
          view,
        },
        "*",
      );

    resizeObserver = new ResizeObserver(postHeight);
    resizeObserver.observe(element);
    postHeight();
  });

  watch(theme, () => {
    if (import.meta.client) applyTheme();
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    removeColorSchemeListener?.();
  });

  return { isEmbed, mode, root, theme };
}
