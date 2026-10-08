export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    const method = getMethod(event);
    if (method !== "GET" && method !== "HEAD") return;

    const url = getRequestURL(event);
    const forwardedHost = getHeader(event, "x-forwarded-host");
    const requestHost = (forwardedHost || getHeader(event, "host") || "")
      .split(",")[0]
      ?.trim();

    if (requestHost === "www.cally.cermuel.dev") {
      await sendRedirect(
        event,
        `https://cally.cermuel.dev${url.pathname}${url.search}`,
        301,
      );
      return;
    }

    if (
      url.pathname.length > 1 &&
      url.pathname.endsWith("/") &&
      !url.pathname.startsWith("/api/")
    ) {
      await sendRedirect(
        event,
        `${url.pathname.replace(/\/+$/, "")}${url.search}`,
        301,
      );
    }
  });

  nitroApp.hooks.hook("error", (_error, context) => {
    if (context.event) {
      setHeader(context.event, "X-Robots-Tag", "noindex, nofollow");
    }
  });
});
