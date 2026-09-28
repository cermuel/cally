import type { IconSvgObject } from "@hugeicons/core-free-icons";
import type { RouteLocationRaw } from "vue-router";

export type BreadcrumbItem = {
  title: string;
  route?: RouteLocationRaw;
  icon?: IconSvgObject;
};

export const useBreadcrumb = () => {
  const route = useRoute();
  const items = useState<BreadcrumbItem[]>("app-breadcrumb-items", () => []);
  const ownerPath = useState<string | null>(
    "app-breadcrumb-owner-path",
    () => null,
  );

  const syncRoute = (path: string) => {
    if (ownerPath.value === path) {
      return;
    }

    ownerPath.value = path;
    items.value = [];
  };

  syncRoute(route.path);
  watch(() => route.path, syncRoute, { flush: "sync" });

  const push = (item: BreadcrumbItem) => {
    syncRoute(route.path);
    items.value.push(item);
  };

  const pop = () => {
    syncRoute(route.path);
    return items.value.pop();
  };

  const getItems = (): readonly BreadcrumbItem[] => {
    syncRoute(route.path);
    return items.value;
  };

  const setItems = (nextItems: readonly BreadcrumbItem[]) => {
    ownerPath.value = route.path;
    items.value = [...nextItems];
  };

  return {
    push,
    pop,
    getItems,
    setItems,
  };
};
