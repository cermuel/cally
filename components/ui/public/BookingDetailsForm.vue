<script setup lang="ts">
const attendeeName = defineModel<string>("attendeeName", { required: true });
const attendeeEmail = defineModel<string>("attendeeEmail", { required: true });
const notes = defineModel<string>("notes", { required: true });

defineEmits<{
  back: [];
  confirm: [];
}>();
</script>

<template>
  <form
    class="flex flex-col space-y-3 p-4 md:space-y-4 md:p-6"
    @submit.prevent="$emit('confirm')"
  >
    <div class="space-y-2">
      <SharedLabel for="public-booking-name">Fullname</SharedLabel>
      <SharedInput id="public-booking-name" v-model="attendeeName" required />
    </div>
    <div class="space-y-2">
      <SharedLabel for="public-booking-email">Email Address</SharedLabel>
      <SharedInput
        id="public-booking-email"
        v-model="attendeeEmail"
        type="email"
        required
      />
    </div>

    <div class="space-y-2">
      <SharedLabel for="public-booking-notes">Notes</SharedLabel>
      <SharedTextarea
        id="public-booking-notes"
        v-model="notes"
        :rows="4"
        class="min-h-20 md:min-h-32"
      />
    </div>

    <div class="flex justify-end gap-4 pt-2 md:pt-5 mt-auto">
      <SharedButton
        type="button"
        variant="secondary"
        class="h-9"
        @click="$emit('back')"
      >
        Back
      </SharedButton>
      <SharedButton type="submit" class="h-9">Schedule</SharedButton>
    </div>
  </form>
</template>
