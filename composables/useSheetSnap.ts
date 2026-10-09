import type { Ref } from "vue";

const SHEET_LEVELS = ["full", "large", "default", "compact"] as const;
const SHEET_TARGETS = [...SHEET_LEVELS, "closed"] as const;
const DRAG_INTENT_THRESHOLD = 8;
const VELOCITY_WINDOW = 120;
const PROJECTION_DECELERATION = 0.99;

type SheetLevel = (typeof SHEET_LEVELS)[number];
type SheetTarget = (typeof SHEET_TARGETS)[number];

type PointerSample = {
  time: number;
  y: number;
};

type SheetElement = HTMLElement | { $el?: HTMLElement };

const rubberBand = (overshoot: number, dimension: number) =>
  (overshoot * dimension * 0.55) /
  (dimension + 0.55 * Math.abs(overshoot));

export function useSheetSnap(open: Ref<boolean>, close: () => void) {
  const sheet = ref<SheetElement | null>(null);
  const isDragging = ref(false);
  const level = ref<SheetLevel>("default");
  const isFull = computed(() => level.value === "full");
  const isMobile = ref(false);
  const reduceMotion = ref(false);

  let mobileQuery: MediaQueryList | undefined;
  let reduceMotionQuery: MediaQueryList | undefined;
  let removeActiveDragListeners: (() => void) | undefined;
  let suppressHandleClick = false;

  const viewportHeight = () =>
    window.visualViewport?.height ?? window.innerHeight;

  const offsetForLevel = (target: SheetLevel) => {
    const visibleRatio =
      target === "full"
        ? 1
        : target === "large"
          ? 0.8
          : target === "default"
            ? 0.6
            : 0.5;
    return viewportHeight() * (1 - visibleRatio);
  };

  const offsetForTarget = (target: SheetTarget) =>
    target === "closed" ? viewportHeight() : offsetForLevel(target);

  const sheetElement = () => {
    const value = sheet.value;
    if (value instanceof HTMLElement) return value;
    return value?.$el instanceof HTMLElement ? value.$el : null;
  };

  const setOffset = (offset: number) => {
    sheetElement()?.style.setProperty("--sheet-offset", `${offset}px`);
  };

  const readPresentedOffset = () => {
    const element = sheetElement();
    if (!element) return offsetForLevel(level.value);

    const transform = getComputedStyle(element).transform;
    if (transform === "none") return offsetForLevel(level.value);
    return new DOMMatrixReadOnly(transform).m42;
  };

  const syncOffset = () => {
    if (!isMobile.value) return;
    setOffset(offsetForLevel(level.value));
  };

  const advanceLevel = () => {
    if (!isMobile.value || isFull.value) return;
    level.value =
      level.value === "compact"
        ? "default"
        : level.value === "default"
          ? "large"
          : "full";
    syncOffset();
  };

  const handleClick = () => {
    if (!suppressHandleClick) advanceLevel();
  };

  const nearestTarget = (
    offset: number,
    targets: readonly SheetTarget[] = SHEET_TARGETS,
  ) =>
    targets.reduce((nearest, candidate) =>
      Math.abs(offsetForTarget(candidate) - offset) <
      Math.abs(offsetForTarget(nearest) - offset)
        ? candidate
        : nearest,
    );

  const startDrag = (event: PointerEvent) => {
    if (
      !isMobile.value ||
      reduceMotion.value ||
      isFull.value ||
      isDragging.value ||
      !event.isPrimary ||
      event.button !== 0
    )
      return;

    const element = sheetElement();
    const handle = event.currentTarget as HTMLElement;
    if (!element) return;

    event.preventDefault();
    handle.setPointerCapture(event.pointerId);

    let startY = event.clientY;
    let startOffset = readPresentedOffset();
    let currentOffset = startOffset;
    let gestureStarted = false;
    let finished = false;
    let samples: PointerSample[] = [{ time: performance.now(), y: event.clientY }];

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      handle.removeEventListener("lostpointercapture", onEnd);
      removeActiveDragListeners = undefined;
    };

    const finishAt = (target: SheetTarget) => {
      isDragging.value = false;
      requestAnimationFrame(() => {
        if (target === "closed") {
          close();
          return;
        }
        level.value = target;
        syncOffset();
      });
    };

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return;
      if ((moveEvent.buttons & 1) === 0) {
        onEnd(moveEvent);
        return;
      }

      if (!gestureStarted) {
        if (Math.abs(moveEvent.clientY - startY) < DRAG_INTENT_THRESHOLD) return;
        gestureStarted = true;
        isDragging.value = true;
        startOffset = readPresentedOffset();
        startY = moveEvent.clientY;
        samples = [{ time: performance.now(), y: moveEvent.clientY }];
      }

      const limit = offsetForTarget("closed");
      const rawOffset = startOffset + moveEvent.clientY - startY;
      currentOffset =
        rawOffset < 0
          ? rubberBand(rawOffset, viewportHeight())
          : rawOffset > limit
            ? limit + rubberBand(rawOffset - limit, viewportHeight())
            : rawOffset;
      setOffset(currentOffset);

      const now = performance.now();
      samples.push({ time: now, y: moveEvent.clientY });
      samples = samples.filter((sample) => now - sample.time <= VELOCITY_WINDOW);
    };

    function onEnd(endEvent: PointerEvent) {
      if (finished || endEvent.pointerId !== event.pointerId) return;
      finished = true;
      cleanup();

      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }

      if (!gestureStarted) return;
      suppressHandleClick = true;
      window.setTimeout(() => {
        suppressHandleClick = false;
      });

      const first = samples[0];
      const last = samples.at(-1);
      const elapsed = first && last ? Math.max(last.time - first.time, 1) : 1;
      const velocity = first && last ? ((last.y - first.y) / elapsed) * 1000 : 0;
      const projectedDistance =
        (velocity / 1000) *
        (PROJECTION_DECELERATION / (1 - PROJECTION_DECELERATION));
      const projectedOffset = currentOffset + projectedDistance;
      const targets =
        level.value === "full"
          ? (["full", "closed"] as const)
          : SHEET_TARGETS;
      const target = nearestTarget(projectedOffset, targets);

      finishAt(target);
    }

    removeActiveDragListeners = cleanup;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    handle.addEventListener("lostpointercapture", onEnd);
  };

  const updateMedia = () => {
    isMobile.value = mobileQuery?.matches ?? false;
    reduceMotion.value = reduceMotionQuery?.matches ?? false;
    syncOffset();
  };

  watch(open, (isOpen) => {
    if (!isOpen) {
      isDragging.value = false;
      level.value = "default";
      return;
    }
    nextTick(syncOffset);
  });

  onMounted(() => {
    mobileQuery = window.matchMedia("(max-width: 47.999rem)");
    reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    updateMedia();
    mobileQuery.addEventListener("change", updateMedia);
    reduceMotionQuery.addEventListener("change", updateMedia);
    window.visualViewport?.addEventListener("resize", syncOffset);
    window.addEventListener("resize", syncOffset);
  });

  onBeforeUnmount(() => {
    removeActiveDragListeners?.();
    mobileQuery?.removeEventListener("change", updateMedia);
    reduceMotionQuery?.removeEventListener("change", updateMedia);
    window.visualViewport?.removeEventListener("resize", syncOffset);
    window.removeEventListener("resize", syncOffset);
  });

  return {
    handleClick,
    isDragging,
    isFull,
    reduceMotion,
    sheet,
    startDrag,
  };
}
