export const isSafeAuthReturnPath = (value: unknown): value is string => {
  if (typeof value !== "string") return false;

  return (
    value === "/app" ||
    value.startsWith("/app/") ||
    value.startsWith("/team/invite?")
  );
};

