import type { Ref } from "vue";

export type TableResizeEdge = "left" | "right";

const resizeStep = 16;

export function useResizableTable(
  container: Ref<HTMLElement | null>,
  minimumWidth: Ref<number>,
) {
  const containerWidth = ref(0);
  const preferredWidth = ref<number | null>(null);
  const left = ref(0);
  const isDragging = ref(false);
  let resizeObserver: ResizeObserver | undefined;
  let stopActiveResize: (() => void) | undefined;

  const minimum = computed(() =>
    Math.min(minimumWidth.value, containerWidth.value || minimumWidth.value),
  );

  const width = computed(() => {
    if (!containerWidth.value) return minimumWidth.value;
    if (preferredWidth.value === null) return containerWidth.value;

    return Math.min(
      containerWidth.value,
      Math.max(minimum.value, preferredWidth.value),
    );
  });

  const setBox = (nextLeft: number, nextWidth: number) => {
    const clampedLeft = Math.min(
      Math.max(nextLeft, 0),
      Math.max(containerWidth.value - minimum.value, 0),
    );
    const clampedWidth = Math.min(
      containerWidth.value - clampedLeft,
      Math.max(minimum.value, nextWidth),
    );

    if (clampedLeft <= 0.5 && clampedWidth >= containerWidth.value - 0.5) {
      left.value = 0;
      preferredWidth.value = null;
      return;
    }

    left.value = clampedLeft;
    preferredWidth.value = clampedWidth;
  };

  const resetWidth = () => {
    left.value = 0;
    preferredWidth.value = null;
  };

  const startResize = (event: PointerEvent, edge: TableResizeEdge) => {
    if (
      isDragging.value ||
      !event.isPrimary ||
      event.button !== 0 ||
      !containerWidth.value
    )
      return;

    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    isDragging.value = true;

    const startX = event.clientX;
    const startLeft = left.value;
    const startWidth = width.value;
    const startRight = startLeft + startWidth;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    let finished = false;

    const removeListeners = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      handle.removeEventListener("lostpointercapture", onEnd);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      stopActiveResize = undefined;
    };

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return;

      if ((moveEvent.buttons & 1) === 0) {
        onEnd(moveEvent);
        return;
      }

      const pointerDelta = moveEvent.clientX - startX;
      if (edge === "left") {
        const nextLeft = Math.min(
          Math.max(startLeft + pointerDelta, 0),
          startRight - minimum.value,
        );
        setBox(nextLeft, startRight - nextLeft);
        return;
      }

      const nextRight = Math.min(
        Math.max(startRight + pointerDelta, startLeft + minimum.value),
        containerWidth.value,
      );
      setBox(startLeft, nextRight - startLeft);
    };

    function onEnd(endEvent: PointerEvent) {
      if (finished || endEvent.pointerId !== event.pointerId) return;
      finished = true;
      removeListeners();

      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }

      isDragging.value = false;
    }

    stopActiveResize = () => onEnd(event);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    handle.addEventListener("lostpointercapture", onEnd);
  };

  const resizeWithKeyboard = (
    event: KeyboardEvent,
    edge: TableResizeEdge,
  ) => {
    if (!containerWidth.value) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
      return;

    event.preventDefault();
    const currentRight = left.value + width.value;

    if (event.key === "Home") {
      if (edge === "left") {
        setBox(currentRight - minimum.value, minimum.value);
      } else {
        setBox(left.value, minimum.value);
      }
      return;
    }

    if (event.key === "End") {
      resetWidth();
      return;
    }

    const pointerDelta = event.key === "ArrowRight" ? resizeStep : -resizeStep;
    if (edge === "left") {
      const nextLeft = Math.min(
        Math.max(left.value + pointerDelta, 0),
        currentRight - minimum.value,
      );
      setBox(nextLeft, currentRight - nextLeft);
    } else {
      const nextRight = Math.min(
        Math.max(currentRight + pointerDelta, left.value + minimum.value),
        containerWidth.value,
      );
      setBox(left.value, nextRight - left.value);
    }
  };

  onMounted(() => {
    if (!container.value) return;

    resizeObserver = new ResizeObserver(([entry]) => {
      containerWidth.value = entry?.contentRect.width ?? 0;

      if (preferredWidth.value !== null) {
        left.value = Math.min(
          left.value,
          Math.max(containerWidth.value - minimum.value, 0),
        );
        preferredWidth.value = Math.min(
          preferredWidth.value,
          containerWidth.value - left.value,
        );
      }
    });
    resizeObserver.observe(container.value);
  });

  onBeforeUnmount(() => {
    stopActiveResize?.();
    resizeObserver?.disconnect();
  });

  return {
    containerWidth,
    isDragging,
    left,
    minimum,
    resetWidth,
    resizeWithKeyboard,
    startResize,
    width,
  };
}
