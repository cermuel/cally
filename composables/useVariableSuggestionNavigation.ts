import type { ComputedRef } from "vue";

export function useVariableSuggestionNavigation(
  suggestions: ComputedRef<string[]>,
  select: (variable: string) => void,
  close: () => void,
) {
  const activeIndex = ref(0);

  watch(suggestions, () => {
    activeIndex.value = 0;
  });

  const setActiveIndex = (index: number) => {
    activeIndex.value = index;
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const items = suggestions.value;
    if (!items.length) return false;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % items.length;
      return true;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex.value = (activeIndex.value - 1 + items.length) % items.length;
      return true;
    }

    if (event.key === "Home") {
      event.preventDefault();
      activeIndex.value = 0;
      return true;
    }

    if (event.key === "End") {
      event.preventDefault();
      activeIndex.value = items.length - 1;
      return true;
    }

    if (event.key === "Enter" || (event.key === "Tab" && !event.shiftKey)) {
      event.preventDefault();
      select(items[activeIndex.value] ?? items[0]);
      return true;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return true;
    }

    return false;
  };

  return {
    activeIndex,
    handleKeydown,
    setActiveIndex,
  };
}
