export const GOOGLE_CALENDAR_EVENTS_SCOPE =
  "https://www.googleapis.com/auth/calendar.events";

export type ConnectionProvider = {
  id: "google" | "slack" | "microsoft";
  name: string;
  description: string;
  icon?: string;
  initials?: string;
  requiredScope?: string;
  canConnect: boolean;
};

export const CONNECTION_PROVIDERS = [
  {
    id: "google",
    name: "Google Calendar",
    description:
      "Check for conflicts and add new bookings with a Google Meet link.",
    icon: "/svg/google.svg",
    requiredScope: GOOGLE_CALENDAR_EVENTS_SCOPE,
    canConnect: true,
  },
  // {
  //   id: "slack",
  //   name: "Slack",
  //   description: "Send booking updates and reminders to your Slack workspace.",
  //   initials: "S",
  //   canConnect: false,
  // },
  // {
  //   id: "microsoft",
  //   name: "Microsoft",
  //   description:
  //     "Connect Outlook Calendar and create Microsoft Teams meetings.",
  //   initials: "M",
  //   canConnect: false,
  // },
] as const satisfies readonly ConnectionProvider[];
