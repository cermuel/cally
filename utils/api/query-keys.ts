export const queryKeys = {
  all: ['cally'] as const,

  auth: {
    all: () => [...queryKeys.all, 'auth'] as const,
    session: () => [...queryKeys.auth.all(), 'session'] as const,
    user: () => [...queryKeys.auth.all(), 'user'] as const,
  },

  users: {
    all: () => [...queryKeys.all, 'users'] as const,
    lists: () => [...queryKeys.users.all(), 'list'] as const,
    list: (filters?: QueryKeyFilters) => [...queryKeys.users.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.users.all(), 'detail'] as const,
    detail: (id: QueryKeyId) => [...queryKeys.users.details(), id] as const,
  },

  availability: {
    all: () => [...queryKeys.all, 'availability'] as const,
    mine: () => [...queryKeys.availability.all(), 'mine'] as const,
    public: (username: string) => [...queryKeys.availability.all(), 'public', username] as const,
  },

  public: {
    all: () => [...queryKeys.all, 'public'] as const,
    profile: (username: string) => [...queryKeys.public.all(), 'profile', username] as const,
    events: (username: string) => [...queryKeys.public.all(), 'events', username] as const,
    schedule: (eventId: QueryKeyId, month: string) => [...queryKeys.public.all(), 'schedule', eventId, month] as const,
  },

  links: {
    all: () => [...queryKeys.all, 'links'] as const,
    lists: () => [...queryKeys.links.all(), 'list'] as const,
    list: () => [...queryKeys.links.lists()] as const,
    details: () => [...queryKeys.links.all(), 'detail'] as const,
    detail: (id: QueryKeyId) => [...queryKeys.links.details(), id] as const,
  },

  bookings: {
    all: () => [...queryKeys.all, 'bookings'] as const,
    lists: () => [...queryKeys.bookings.all(), 'list'] as const,
    list: (filters?: QueryKeyFilters) => [...queryKeys.bookings.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.bookings.all(), 'detail'] as const,
    detail: (id: QueryKeyId) => [...queryKeys.bookings.details(), id] as const,
  },

  guests: {
    all: () => [...queryKeys.all, 'guests'] as const,
    list: (bookingId: QueryKeyId) => [...queryKeys.guests.all(), 'list', bookingId] as const,
    detail: (bookingId: QueryKeyId, email: string) => [...queryKeys.guests.all(), 'detail', bookingId, email] as const,
  },

  connections: {
    all: () => [...queryKeys.all, 'connections'] as const,
    list: () => [...queryKeys.connections.all(), 'list'] as const,
  },
} as const

export type QueryKeyId = string | number
export type QueryKeyFilters = Record<string, string | number | boolean | null | undefined>
