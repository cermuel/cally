export type StepId = 'profile' | 'calendar' | 'availability'

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type TimeRange = { id: string; start: string; end: string }

export type DaySchedule = { enabled: boolean; ranges: TimeRange[] }

export type Availability = Record<DayKey, DaySchedule>

export type UsernameStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken'
