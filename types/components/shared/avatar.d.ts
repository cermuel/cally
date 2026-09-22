import type { AvatarFallbackProps, AvatarImageProps, AvatarRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface SharedAvatarProps extends AvatarRootProps {
  class?: HTMLAttributes['class']
}

export interface SharedAvatarImageProps extends AvatarImageProps {
  class?: HTMLAttributes['class']
}

export interface SharedAvatarFallbackProps extends AvatarFallbackProps {
  class?: HTMLAttributes['class']
}
