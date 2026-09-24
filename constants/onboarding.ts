import type { DayKey, StepId } from "~/types/onboarding";

export const APP_NAME = "Cally";
export const LINK_PREFIX = "cally.cermuel.dev/";

export const HERO = {
  title: "Your time, shared in one link.",
  subtitle: "Let people book you without the back and forth.",
};

export const STEPS: { id: StepId; title: string }[] = [
  {
    id: "profile",
    title: "Set up your profile",
  },
  {
    id: "calendar",
    title: "Connect your calendar",
  },
  {
    id: "availability",
    title: "Set your availability",
  },
];

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
export const USERNAME_DEBOUNCE_MS = 400;
export const RESERVED_USERNAMES = [
  "admin",
  "api",
  "app",
  "login",
  "signup",
  "settings",
  "onboarding",
  "dashboard",
  "help",
  "support",
];

export const MOCK_TAKEN_USERNAMES = ["cermuel", "samuel", "demo", "test"];

export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const CALENDAR_NOTES = [
  "Busy times on your calendar are blocked automatically.",
  "New bookings are added to your calendar with a meeting link.",
];

export const CONNECTED_CALENDAR_ACCOUNT = {
  name: "Samuel Cermuel",
  email: "samuel@gmail.com",
};

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "sunday", label: "Sunday" },
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
];

export const WEEKDAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];
export const DEFAULT_RANGE = { start: "09:00", end: "17:00" };
export const TIME_STEP_MINUTES = 15;
export const LAST_TIME_MINUTES = 23 * 60 + 45;
export const NEW_RANGE_GAP_MINUTES = 60;
export const NEW_RANGE_LENGTH_MINUTES = 60;
export const MAX_RANGES_PER_DAY = 4;
