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

  bookings: {
    all: () => [...queryKeys.all, 'bookings'] as const,
    lists: () => [...queryKeys.bookings.all(), 'list'] as const,
    list: (filters?: QueryKeyFilters) => [...queryKeys.bookings.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.bookings.all(), 'detail'] as const,
    detail: (id: QueryKeyId) => [...queryKeys.bookings.details(), id] as const,
  },
} as const

export type QueryKeyId = string | number
export type QueryKeyFilters = Record<string, string | number | boolean | null | undefined>
