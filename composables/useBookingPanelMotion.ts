export const useBookingPanelMotion = (confirmed: Ref<boolean>) => {
  const panel = ref<HTMLElement | null>(null);
  let animation: Animation | undefined;

  watch(confirmed, async (isConfirmed) => {
    const before = panel.value?.getBoundingClientRect();
    animation?.cancel();
    await nextTick();
    const element = panel.value;
    if (!before || !element) return;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const after = element.getBoundingClientRect();
      animation = element.animate([
        { transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})` },
        { transform: "translate(0, 0) scale(1, 1)" },
      ], {
        duration: 300,
        easing: getComputedStyle(element).getPropertyValue("--ease-out").trim(),
      });
    }

    if (isConfirmed) {
      element.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    }
  });

  onBeforeUnmount(() => animation?.cancel());
  return panel;
};
