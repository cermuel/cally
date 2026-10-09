const privatePrefixes = [
  "/app",
  "/auth",
  "/api",
  "/google",
  "/settings",
  "/public",
  "/team",
];

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  if (
    privatePrefixes.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )
  ) {
    setHeader(event, "X-Robots-Tag", "noindex, nofollow");
  }
});
