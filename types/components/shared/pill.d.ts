import type { HTMLAttributes } from "vue";

export type PillValue =
  | "accepted"
  | "active"
  | "cancelled"
  | "completed"
  | "coming-soon"
  | "confirmed"
  | "connected"
  | "declined"
  | "draft"
  | "expired"
  | "failed"
  | "inactive"
  | "pending"
  | "processing"
  | "published"
  | "rejected";

export interface PillProps {
  value: PillValue;
  class?: HTMLAttributes["class"];
}
