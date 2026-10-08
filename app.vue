<script setup lang="ts">
import { Toaster } from "./components/shared/sonner";

useHead({ htmlAttrs: { lang: "en" } });

useSchemaOrg([
  defineOrganization({
    name: "Cally",
    url: "https://cally.cermuel.dev",
    logo: "https://cally.cermuel.dev/logo.png",
  }),
  defineWebSite({
    name: "Cally",
    url: "https://cally.cermuel.dev",
    inLanguage: "en",
  }),
  defineSoftwareApp({
    name: "Cally",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://cally.cermuel.dev",
    description:
      "A meeting scheduler for sharing availability, booking meetings, and keeping Google Calendar in sync.",
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      description: "Free to start",
    },
  }),
]);
</script>

<template>
  <NuxtPage />
  <Toaster />
</template>
