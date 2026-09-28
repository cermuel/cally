export type AppSidebarMode = "expanded" | "compact" | "hidden";

interface AppSidebarPreference {
  mode: AppSidebarMode;
  width: number;
}

export const APP_SIDEBAR_EXPANDED_MIN = 200;
export const APP_SIDEBAR_EXPANDED_MAX = 300;
export const APP_SIDEBAR_COMPACT_WIDTH = 64;

const storageKey = "cally-sidebar";
const collapseThreshold = 36;
const settleDuration = 240;

const isSidebarMode = (value: unknown): value is AppSidebarMode =>
  typeof value === "string" &&
  ["expanded", "compact", "hidden"].includes(value);

const clampExpandedWidth = (width: number) =>
  Math.min(APP_SIDEBAR_EXPANDED_MAX, Math.max(APP_SIDEBAR_EXPANDED_MIN, width));

export function useAppSidebar() {
  const preferenceCookie = useCookie<AppSidebarPreference | null>(storageKey, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  const initialPreference = preferenceCookie.value;
  const route = useRoute();

  const mode = ref<AppSidebarMode>(
    isSidebarMode(initialPreference?.mode)
      ? initialPreference.mode
      : "expanded",
  );
  const expandedWidth = ref(
    typeof initialPreference?.width === "number"
      ? clampExpandedWidth(initialPreference.width)
      : 272,
  );
  const transientWidth = ref<number | null>(null);
  const isMobile = ref(false);
  const mobileOpen = ref(false);
  const isDragging = ref(false);
  const isSettling = ref(false);
  const motionReady = ref(false);

  let mediaQuery: MediaQueryList | undefined;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;

  const sidebarWidth = computed(() => {
    if (transientWidth.value !== null) return transientWidth.value;
    if (isMobile.value || mode.value === "hidden") return 0;
    if (mode.value === "compact") return APP_SIDEBAR_COMPACT_WIDTH;
    return expandedWidth.value;
  });

  const hideSidebarCopy = computed(
    () =>
      !isMobile.value &&
      (mode.value !== "expanded" ||
        (transientWidth.value !== null &&
          transientWidth.value < APP_SIDEBAR_EXPANDED_MIN)),
  );

  const persistSidebar = () => {
    const preference: AppSidebarPreference = {
      mode: mode.value,
      width: expandedWidth.value,
    };
    preferenceCookie.value = preference;

    if (import.meta.client) {
      localStorage.setItem(storageKey, JSON.stringify(preference));
    }
  };

  const finishSettling = () => {
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      isSettling.value = false;
    }, settleDuration);
  };

  const updateViewport = (event?: MediaQueryListEvent) => {
    isMobile.value = event?.matches ?? mediaQuery?.matches ?? false;
    if (!isMobile.value) mobileOpen.value = false;
  };

  const openSidebar = () => {
    if (isMobile.value) {
      mobileOpen.value = true;
      nextTick(() =>
        document.querySelector<HTMLElement>("#app-sidebar a")?.focus(),
      );
      return;
    }

    isSettling.value = true;
    mode.value = "expanded";
    persistSidebar();
    finishSettling();
  };

  const closeSidebar = () => {
    if (isMobile.value) {
      mobileOpen.value = false;
      nextTick(() =>
        document
          .querySelector<HTMLButtonElement>("#app-sidebar-toggle")
          ?.focus(),
      );
      return;
    }

    mode.value = "hidden";
    persistSidebar();
  };

  const startResize = (event: PointerEvent) => {
    if (
      isMobile.value ||
      isDragging.value ||
      !event.isPrimary ||
      event.button !== 0
    )
      return;

    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    isDragging.value = true;

    const startX = event.clientX;
    const startMode = mode.value;
    const startWidth = expandedWidth.value;
    let currentDelta = 0;
    let finished = false;

    const removePointerListeners = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      handle.removeEventListener("lostpointercapture", onEnd);
    };

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return;

      if ((moveEvent.buttons & 1) === 0) {
        onEnd(moveEvent);
        return;
      }

      currentDelta = moveEvent.clientX - startX;

      if (startMode === "expanded") {
        const nextWidth = clampExpandedWidth(startWidth + currentDelta);
        transientWidth.value = nextWidth;
        expandedWidth.value = nextWidth;
      }
    };

    function onEnd(endEvent: PointerEvent) {
      if (finished || endEvent.pointerId !== event.pointerId) return;
      finished = true;
      removePointerListeners();

      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }

      let targetMode = startMode;
      if (
        startMode === "expanded" &&
        startWidth <= APP_SIDEBAR_EXPANDED_MIN &&
        currentDelta < -collapseThreshold
      ) {
        targetMode = "compact";
      } else if (startMode === "compact" && currentDelta < -collapseThreshold) {
        targetMode = "hidden";
      } else if (startMode === "compact" && currentDelta > collapseThreshold) {
        targetMode = "expanded";
        expandedWidth.value = APP_SIDEBAR_EXPANDED_MIN;
      }

      if (targetMode !== startMode) isSettling.value = true;
      isDragging.value = false;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mode.value = targetMode;
          transientWidth.value = null;
          persistSidebar();
          if (targetMode !== startMode) finishSettling();
        });
      });
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    handle.addEventListener("lostpointercapture", onEnd);
  };

  const resizeWithKeyboard = (event: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    if (event.key === "Home") {
      mode.value = "compact";
    } else if (event.key === "End") {
      mode.value = "expanded";
      expandedWidth.value = APP_SIDEBAR_EXPANDED_MAX;
    } else if (event.key === "ArrowLeft") {
      if (
        mode.value === "expanded" &&
        expandedWidth.value > APP_SIDEBAR_EXPANDED_MIN
      ) {
        expandedWidth.value = Math.max(
          APP_SIDEBAR_EXPANDED_MIN,
          expandedWidth.value - 16,
        );
      } else {
        mode.value = mode.value === "expanded" ? "compact" : "hidden";
      }
    } else if (mode.value === "compact") {
      mode.value = "expanded";
      expandedWidth.value = APP_SIDEBAR_EXPANDED_MIN;
    } else {
      expandedWidth.value = Math.min(
        APP_SIDEBAR_EXPANDED_MAX,
        expandedWidth.value + 16,
      );
    }

    persistSidebar();
  };

  const handleWindowKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && mobileOpen.value) closeSidebar();
  };

  watch(
    () => route.fullPath,
    () => {
      if (isMobile.value) mobileOpen.value = false;
    },
  );

  watch(mobileOpen, (open) => {
    if (import.meta.client) document.body.style.overflow = open ? "hidden" : "";
  });

  onMounted(() => {
    const savedPreference = initialPreference
      ? null
      : localStorage.getItem(storageKey);
    if (savedPreference !== null) {
      try {
        const parsed = JSON.parse(
          savedPreference,
        ) as Partial<AppSidebarPreference>;
        if (isSidebarMode(parsed.mode)) mode.value = parsed.mode;
        if (typeof parsed.width === "number")
          expandedWidth.value = clampExpandedWidth(parsed.width);
        persistSidebar();
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    mediaQuery = window.matchMedia("(max-width: 47.999rem)");
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    window.addEventListener("keydown", handleWindowKeydown);
    nextTick(() =>
      requestAnimationFrame(() => {
        motionReady.value = true;
      }),
    );
  });

  onBeforeUnmount(() => {
    if (settleTimer) clearTimeout(settleTimer);
    mediaQuery?.removeEventListener("change", updateViewport);
    window.removeEventListener("keydown", handleWindowKeydown);
    document.body.style.overflow = "";
  });

  return {
    closeSidebar,
    hideSidebarCopy,
    isDragging,
    isMobile,
    isSettling,
    mobileOpen,
    mode,
    motionReady,
    openSidebar,
    resizeWithKeyboard,
    sidebarWidth,
    startResize,
  };
}
