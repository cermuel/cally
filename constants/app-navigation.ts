import {
  CalendarRangeIcon,
  AiSwapIcon,
  Link01Icon,
  Settings01Icon,
  TimeScheduleIcon,
  BookUserIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

export interface AppNavigationItem {
  label: string;
  to: string;
  icon: typeof CalendarRangeIcon;
}

export const appNavigationItems = [
  { label: "Bookings", to: "/app/bookings", icon: CalendarRangeIcon },
  { label: "Links", to: "/app/links", icon: Link01Icon },
  { label: "Availability", to: "/app/availability", icon: TimeScheduleIcon },
  { label: "Contacts", to: "/app/contacts", icon: BookUserIcon },
  { label: "Teams", to: "/app/teams", icon: UserGroupIcon },
  { label: "Automations", to: "/app/automations", icon: AiSwapIcon },
  { label: "Settings", to: "/app/settings", icon: Settings01Icon },
] satisfies readonly AppNavigationItem[];
