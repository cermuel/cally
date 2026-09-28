import type { HTMLAttributes } from "vue";

export interface SharedAvatarProps {
  image?: string;
  name: string;
  class?: HTMLAttributes["class"];
}
