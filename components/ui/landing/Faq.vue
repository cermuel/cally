<script setup lang="ts">
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const openQuestion = ref<number | null>(null);

const toggleQuestion = (index: number) => {
  openQuestion.value = openQuestion.value === index ? null : index;
};

const questions = [
  {
    question: "How does Cally know when I’m free?",
    answer: "Connect your Google Calendar and set your usual weekly availability. Cally checks both before showing a time to a guest, so existing events stay protected.",
  },
  {
    question: "What happens after someone books?",
    answer: "Cally creates the calendar event, adds a Google Meet link, and sends the meeting details to both you and your guest automatically.",
  },
  {
    question: "Can I offer different kinds of meetings?",
    answer: "Yes. Create separate booking options with their own name, description, duration, and availability, then show them together on your public page.",
  },
  {
    question: "Do guests need a Cally account?",
    answer: "No. Guests open your link, choose a meeting and an available time, then enter their details to book.",
  },
  {
    question: "Can I change my booking page later?",
    answer: "Any time. Update your profile, meeting types, or weekly availability from your dashboard and your public page reflects the changes.",
  },
];
</script>

<template>
  <section id="faq" class="mx-auto w-full max-w-5xl scroll-mt-12 px-5 pb-28 pt-4 sm:px-8 sm:pb-36">
    <div class="mx-auto mb-10 max-w-xl text-center sm:mb-12">
      <p class="mb-3 text-sm font-medium text-muted-foreground">FAQ</p>
      <h2 class="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
        A few things to know
      </h2>
    </div>

    <div class="mx-auto max-w-3xl">
      <div
        v-for="(item, index) in questions"
        :key="item.question"
        class="faq-item overflow-hidden bg-foreground/5"
        :data-state="openQuestion === index ? 'open' : 'closed'"
      >
        <h3>
          <button
            :id="`faq-trigger-${index}`"
            type="button"
            class="flex min-h-14 w-full items-center justify-between gap-4 px-5 text-start text-[15px] font-medium text-foreground outline-none transition-colors focus-visible:bg-foreground/5"
            :aria-expanded="openQuestion === index"
            :aria-controls="`faq-answer-${index}`"
            @click="toggleQuestion(index)"
          >
            {{ item.question }}
            <HugeiconsIcon
              class="faq-chevron shrink-0 text-muted-foreground"
              :icon="ArrowDown01Icon"
              :size="16"
              :stroke-width="1.75"
              aria-hidden="true"
            />
          </button>
        </h3>
        <div
          :id="`faq-answer-${index}`"
          class="faq-answer grid"
          role="region"
          :aria-labelledby="`faq-trigger-${index}`"
          :aria-hidden="openQuestion !== index"
          :inert="openQuestion !== index"
        >
          <div class="faq-answer-inner min-h-0 overflow-hidden px-5">
            <p class="max-w-2xl pb-5 pe-8 text-[15px] leading-6 text-muted-foreground">
              {{ item.answer }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-item {
  --faq-spring: linear(
    0,
    0.09 5%,
    0.31 10%,
    0.57 15%,
    0.79 20%,
    0.95 25%,
    1.04 32%,
    1.06 40%,
    1.04 50%,
    1.01 65%,
    0.997 80%,
    1
  );
  border-radius: 0;
  transition:
    border-radius 480ms var(--faq-spring),
    margin 480ms var(--faq-spring);
}

.faq-item[data-state="open"] {
  margin-block: 0.75rem;
  border-radius: 1.75rem;
}

.faq-item:first-child[data-state="open"] {
  margin-top: 0;
}

.faq-item:last-child[data-state="open"] {
  margin-bottom: 0;
}

.faq-item[data-state="closed"]:first-child,
.faq-item[data-state="open"] + .faq-item[data-state="closed"] {
  border-start-start-radius: 1.75rem;
  border-start-end-radius: 1.75rem;
}

.faq-item[data-state="closed"]:last-child,
.faq-item[data-state="closed"]:has(+ .faq-item[data-state="open"]) {
  border-end-start-radius: 1.75rem;
  border-end-end-radius: 1.75rem;
}

.faq-answer {
  grid-template-rows: 0fr;
  transition:
    grid-template-rows 180ms var(--ease-out),
    opacity 140ms var(--ease-out);
}

.faq-answer-inner {
  opacity: 0;
  transform: translateY(-32%) scaleY(0.01);
  transform-origin: center;
  transition:
    opacity 140ms var(--ease-out),
    transform 180ms var(--ease-out);
}

.faq-item[data-state="open"] .faq-answer {
  grid-template-rows: 1fr;
  transition: grid-template-rows 560ms var(--faq-spring);
}

.faq-item[data-state="open"] .faq-answer-inner {
  opacity: 1;
  transform: translateY(0) scaleY(1);
  transition:
    opacity 180ms var(--ease-out),
    transform 560ms var(--faq-spring);
}

.faq-chevron {
  transform: rotate(0deg);
  transition: transform 480ms var(--faq-spring);
}

.faq-item[data-state="open"] .faq-chevron {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .faq-item {
    transition-duration: 1ms;
  }

  .faq-answer {
    transition: opacity 120ms var(--ease-out);
  }

  .faq-answer-inner {
    transform: none;
    transition: opacity 120ms var(--ease-out);
  }

  .faq-chevron {
    transition-duration: 1ms;
  }
}
</style>
