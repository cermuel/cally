import type { PublicApiEvent, PublicApiUser } from "./api/public";

export type PublicBookingStep = "slots" | "details" | "scheduled";

export type PublicProfile = {
  name: string;
  email: string;
  username: string;
  description: string | null;
  image?: string;
  timezone: string;
};

export type PublicEvent = {
  id: number;
  slug: string;
  title: string;
  durationMinutes: number;
  durationLabel: string;
  description: string;
};

export type PublicCalendarDay = {
  key: string;
  day: string;
  muted: boolean;
  available: boolean;
  today: boolean;
};

export const publicProfile: PublicProfile = {
  name: "Samuel Ngene",
  email: "samuelobasi2005@gmail.com",
  username: "samuel-ngene",
  description: null,
  image: undefined,
  timezone: "UTC",
};

export const publicAvailableDates = new Set([
  "2026-09-25",
  "2026-09-28",
  "2026-09-29",
  "2026-09-30",
  "2026-10-01",
  "2026-10-02",
  "2026-10-05",
  "2026-10-06",
  "2026-10-07",
  "2026-10-08",
  "2026-10-09",
]);

export const publicSlots = [
  "9:00am",
  "9:15am",
  "9:30am",
  "9:45am",
  "10:00am",
  "10:15am",
  "10:30am",
  "10:45am",
  "11:00am",
  "11:15am",
  "11:30am",
  "11:45am",
  "12:00pm",
  "12:15pm",
  "12:30pm",
  "12:45pm",
];

export const getPublicEvent = (eventSlug: string): PublicEvent => {
  const isThirty = eventSlug.includes("30");

  return {
    id: isThirty ? 2 : 1,
    slug: eventSlug,
    title: isThirty ? "30 min meeting" : "15 min meeting",
    durationMinutes: isThirty ? 30 : 15,
    durationLabel: isThirty ? "30m" : "15m",
    description: isThirty
      ? "A deeper session for walkthroughs, planning, or support."
      : "A quick check-in for focused questions and next steps.",
  };
};

export const mapPublicProfile = (user: PublicApiUser): PublicProfile => ({
  name: user.name,
  email: user.email,
  username: user.username,
  description: user.description,
  image: user.avatar || undefined,
  timezone: user.timezone,
});

export const mapPublicEvent = (event: PublicApiEvent): PublicEvent => ({
  id: event.id,
  slug: event.slug,
  title: event.name,
  durationMinutes: event.duration_minutes,
  durationLabel: `${event.duration_minutes}m`,
  description: event.description || "",
});

export const getPublicDescriptionFirstLine = (html: string) =>
  html
    .replace(/<\/(p|li|h[1-6]|div|blockquote)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) ?? "";

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const isSameMonth = (dateKey: string, monthDate: Date) => {
  const date = new Date(`${dateKey}T12:00:00`);

  return (
    date.getFullYear() === monthDate.getFullYear() &&
    date.getMonth() === monthDate.getMonth()
  );
};

export const getPublicCalendarDays = (
  activeMonth: Date,
  availableDates: Set<string>,
): PublicCalendarDay[] => {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay.getDay() }, (_, index) => ({
    key: `blank-${year}-${month}-${index}`,
    day: "",
    muted: true,
    available: false,
    today: false,
  }));
  const days = Array.from({ length: lastDay }, (_, index) => {
    const date = new Date(year, month, index + 1);
    const key = toDateKey(date);

    return {
      key,
      day: String(index + 1),
      muted: false,
      available: availableDates.has(key),
      today: key === toDateKey(new Date()),
    };
  });

  return [...blanks, ...days];
};

export const formatPublicDateLabel = (dateKey: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));

export const formatPublicSlotHeading = (dateKey: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
  })
    .format(new Date(`${dateKey}T12:00:00`))
    .replace(",", "");

export const formatPublicTimeRange = (
  dateKey: string,
  selectedTime: string,
  durationMinutes: number,
) => {
  const [hourMinute, suffix = ""] = selectedTime.toLowerCase().split(/(?=am|pm)/);
  const [hour, minute] = hourMinute.split(":").map(Number);
  const startHour = suffix === "pm" && hour !== 12
    ? hour + 12
    : suffix === "am" && hour === 12
      ? 0
      : hour;
  const start = new Date(
    `${dateKey}T${String(startHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
  );
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${timeFormatter.format(start).toLowerCase()} - ${timeFormatter.format(end).toLowerCase()}`;
};

export const formatPublicSlotLabel = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date).toLowerCase();
};
