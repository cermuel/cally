import {
  DAYS,
  DEFAULT_RANGE,
  LAST_TIME_MINUTES,
  NEW_RANGE_GAP_MINUTES,
  NEW_RANGE_LENGTH_MINUTES,
  RESERVED_USERNAMES,
  TIME_STEP_MINUTES,
  USERNAME_MAX,
  USERNAME_MIN,
  WEEKDAYS,
} from "~/constants/onboarding";
import type { Availability, TimeRange } from "~/types/onboarding";

const pad = (n: number) => String(n).padStart(2, "0");

export const toMinutes = (time: string) => {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
};

export const fromMinutes = (minutes: number) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

export const formatTime = (time: string) => {
  const minutes = toMinutes(time);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour < 12 ? "am" : "pm";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${pad(minute)}${period}`;
};

export const TIME_OPTIONS = Array.from(
  { length: LAST_TIME_MINUTES / TIME_STEP_MINUTES + 1 },
  (_, i) => fromMinutes(i * TIME_STEP_MINUTES),
);

// Ranges
export const uid = () => crypto.randomUUID();

export const makeRange = (
  start = DEFAULT_RANGE.start,
  end = DEFAULT_RANGE.end,
): TimeRange => ({
  id: uid(),
  start,
  end,
});

export const cloneRanges = (ranges: TimeRange[]) =>
  ranges.map((r) => makeRange(r.start, r.end));

export const shiftEnd = (start: string) =>
  fromMinutes(
    Math.min(toMinutes(start) + NEW_RANGE_LENGTH_MINUTES, LAST_TIME_MINUTES),
  );

export const getNextRange = (ranges: TimeRange[]): TimeRange | null => {
  const lastEnd = Math.max(0, ...ranges.map((r) => toMinutes(r.end)));
  const start = lastEnd + NEW_RANGE_GAP_MINUTES;
  const end = start + NEW_RANGE_LENGTH_MINUTES;
  if (end > LAST_TIME_MINUTES) return null;
  return makeRange(fromMinutes(start), fromMinutes(end));
};

export const validateRanges = (ranges: TimeRange[]) => {
  if (ranges.some((r) => toMinutes(r.end) <= toMinutes(r.start))) {
    return "End time must be after start time.";
  }
  const sorted = [...ranges].sort(
    (a, b) => toMinutes(a.start) - toMinutes(b.start),
  );
  for (let i = 1; i < sorted.length; i++) {
    if (toMinutes(sorted[i]!.start) < toMinutes(sorted[i - 1]!.end)) {
      return "Time ranges cannot overlap.";
    }
  }
  return null;
};

// Availability
export const createDefaultAvailability = () =>
  Object.fromEntries(
    DAYS.map((d) => [
      d.key,
      { enabled: WEEKDAYS.includes(d.key), ranges: [makeRange()] },
    ]),
  ) as Availability;

export const getAvailabilityError = (availability: Availability) => {
  const active = DAYS.filter((d) => availability[d.key].enabled);
  if (!active.length) return "Turn on at least one day.";
  for (const d of active) {
    const error = validateRanges(availability[d.key].ranges);
    if (error) return `${d.label}: ${error}`;
  }
  return null;
};

// Profile
export const normalizeUsername = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, USERNAME_MAX);

export const getUsernameError = (username: string) => {
  if (username.length < USERNAME_MIN)
    return `Use at least ${USERNAME_MIN} characters.`;
  if (!/^[a-z0-9]/.test(username)) return "Start with a letter or number.";
  if (RESERVED_USERNAMES.includes(username))
    return "That username is reserved.";
  return null;
};

export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
