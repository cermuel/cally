import type { IconSvgObject } from "@hugeicons/core-free-icons";
import {
  CalendarRangeIcon,
  Link01Icon,
  Settings01Icon,
  TimeScheduleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

export interface AppNavigationItem {
  label: string;
  to: string;
  icon: IconSvgObject;
}

export const appNavigationItems = [
  { label: "Bookings", to: "/app/bookings", icon: CalendarRangeIcon },
  { label: "Links", to: "/app/links", icon: Link01Icon },
  { label: "Availability", to: "/app/availability", icon: TimeScheduleIcon },
  { label: "Settings", to: "/app/settings", icon: Settings01Icon },
] satisfies readonly AppNavigationItem[];
