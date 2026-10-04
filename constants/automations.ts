import {
  CheckmarkCircle02Icon,
  Contact01Icon,
  MailSend01Icon,
} from "@hugeicons/core-free-icons";
import type {
  AutomationAction,
  AutomationTrigger,
  GuestType,
} from "~/utils/api/automations";

export const automationTriggers = [
  { value: "booking.created", label: "Booking created" },
  { value: "booking.ended", label: "Booking ended" },
  { value: "booking.no_show", label: "Booking marked as no-show" },
  { value: "booking.cancelled", label: "Booking cancelled" },
] satisfies readonly { value: AutomationTrigger; label: string }[];

export const automationActions = [
  {
    value: "auto_accept_booking",
    label: "Automatically accept booking",
    description: "Confirm a new booking without manual approval.",
    icon: CheckmarkCircle02Icon,
  },
  {
    value: "send_email",
    label: "Send email",
    description: "Send a personalised message to guests.",
    icon: MailSend01Icon,
  },
  {
    value: "add_to_contact",
    label: "Add to contacts",
    description: "Create a contact from the booking details.",
    icon: Contact01Icon,
  },
] satisfies readonly {
  value: AutomationAction;
  label: string;
  description: string;
  icon: typeof CheckmarkCircle02Icon;
}[];

export const allowedAutomationActions: Record<
  AutomationTrigger,
  readonly AutomationAction[]
> = {
  "booking.created": [
    "auto_accept_booking",
    "send_email",
    "add_to_contact",
  ],
  "booking.ended": ["send_email"],
  "booking.no_show": ["send_email"],
  "booking.cancelled": ["send_email"],
};

export const guestTypes = [
  { value: "pending", label: "Pending guests" },
  { value: "confirmed", label: "Confirmed guests" },
  { value: "cancelled", label: "Cancelled guests" },
] satisfies readonly { value: GuestType; label: string }[];

export const getAutomationTriggerLabel = (trigger: AutomationTrigger) =>
  automationTriggers.find((item) => item.value === trigger)?.label ?? trigger;

export const getAutomationAction = (action: AutomationAction) =>
  automationActions.find((item) => item.value === action);
