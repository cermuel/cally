import type { InjectionKey } from "vue";
import { toast } from "vue-sonner";
import {
  DAYS,
  DEFAULT_RANGE,
  MAX_RANGES_PER_DAY,
  STEPS,
  USERNAME_DEBOUNCE_MS,
  USERNAME_MIN,
} from "~/constants/onboarding";
import {
  cloneRanges,
  createDefaultAvailability,
  getAvailabilityError,
  getNextRange,
  getUsernameError,
  makeRange,
  shiftEnd,
  toMinutes,
  validateRanges,
} from "~/helpers/onboarding";
import { availabilityApi } from "~/utils/api/availability";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import { usersApi } from "~/utils/api/users";
import type { Availability, DayKey, UsernameStatus } from "~/types/onboarding";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useOnboarding = () => {
  const apiClient = useApiClient();
  const auth = useAuth();
  const stepIndex = ref(0);
  const direction = ref<1 | -1>(1);
  const step = computed(() => STEPS[stepIndex.value]!);
  const submitting = ref(false);
  const timezone = ref("");

  const profile = reactive({
    username: "",
    name: "",
  });
  const avatarError = ref<string | null>(null);
  const usernameStatus = ref<UsernameStatus>("idle");
  const usernameError = ref<string | null>(null);

  let checkTimer: ReturnType<typeof setTimeout> | undefined;
  let checkId = 0;

  watch(
    () => profile.username,
    (username) => {
      clearTimeout(checkTimer);
      checkId++;
      usernameError.value = null;

      if (!username) {
        usernameStatus.value = "idle";
        return;
      }

      if (username.length < USERNAME_MIN) {
        usernameStatus.value = "idle";
        return;
      }

      usernameError.value = getUsernameError(username);
      if (usernameError.value) {
        usernameStatus.value = "invalid";
        return;
      }

      if (auth.user.value?.username === username) {
        usernameStatus.value = "available";
        return;
      }

      usernameStatus.value = "checking";
      const id = checkId;
      checkTimer = setTimeout(async () => {
        try {
          await usersApi.checkUsername(apiClient, username);
          if (id !== checkId) return;
          usernameStatus.value = "available";
        } catch {
          if (id === checkId) usernameStatus.value = "taken";
        }
      }, USERNAME_DEBOUNCE_MS);
    },
  );

  const calendar = reactive({ connected: false, connecting: false });

  const connectCalendar = async () => {
    calendar.connecting = true;

    await sleep(1400);
    calendar.connected = true;
    calendar.connecting = false;
  };

  const availability = ref<Availability>(createDefaultAvailability());

  const dayErrors = computed(
    () =>
      Object.fromEntries(
        DAYS.map((d) => [
          d.key,
          availability.value[d.key].enabled
            ? validateRanges(availability.value[d.key].ranges)
            : null,
        ]),
      ) as Record<DayKey, string | null>,
  );

  const availabilityError = computed(() =>
    getAvailabilityError(availability.value),
  );

  const toggleDay = (day: DayKey, enabled: boolean) => {
    availability.value[day].enabled = enabled;
  };

  const addRange = (day: DayKey) => {
    const ranges = availability.value[day].ranges;
    if (ranges.length >= MAX_RANGES_PER_DAY) return;
    const next = getNextRange(ranges);
    if (next) ranges.push(next);
  };

  const removeRange = (day: DayKey, id: string) => {
    const schedule = availability.value[day];
    if (schedule.ranges.length === 1) {
      schedule.enabled = false;
      schedule.ranges = [makeRange(DEFAULT_RANGE.start, DEFAULT_RANGE.end)];
      return;
    }
    schedule.ranges = schedule.ranges.filter((r) => r.id !== id);
  };

  const updateRange = (
    day: DayKey,
    id: string,
    field: "start" | "end",
    value: string,
  ) => {
    const range = availability.value[day].ranges.find((r) => r.id === id);
    if (!range) return;
    range[field] = value;
    if (field === "start" && toMinutes(range.end) <= toMinutes(value))
      range.end = shiftEnd(value);
  };

  const copyDay = (from: DayKey, targets: DayKey[]) => {
    const source = availability.value[from];
    for (const key of targets) {
      if (key === from) continue;
      availability.value[key] = {
        enabled: source.enabled,
        ranges: cloneRanges(source.ranges),
      };
    }
  };

  // Flow
  const canContinue = computed(() => {
    switch (step.value.id) {
      case "profile":
        return (
          profile.name.trim().length >= 2 &&
          usernameStatus.value === "available"
        );
      case "calendar":
        return true;
      case "availability":
        return !availabilityError.value;
    }
  });

  const createAvailabilitySlots = async () => {
    const requests = DAYS.flatMap((day) => {
      const schedule = availability.value[day.key];

      if (!schedule.enabled) {
        return [];
      }

      return schedule.ranges.map((range) =>
        availabilityApi.create(apiClient, {
          day: day.key,
          start_time: range.start,
          end_time: range.end,
        }),
      );
    });

    await Promise.all(requests);
  };

  const saveProfile = async () => {
    submitting.value = true;

    try {
      const response = await usersApi.editProfile(apiClient, {
        name: profile.name.trim(),
        username: profile.username,
      });

      auth.setUser(response.user);
      return true;
    } catch (error) {
      const usernameErrors = getApiFieldErrors(error).username ?? [];
      const isCurrentUsernameTakenError =
        auth.user.value?.username === profile.username &&
        usernameErrors.some((message) =>
          message.toLowerCase().includes("already been taken"),
        );

      if (isCurrentUsernameTakenError) {
        return true;
      }

      toast.error(
        getApiErrorMessage(error, "Unable to save your profile. Please try again."),
      );
      return false;
    } finally {
      submitting.value = false;
    }
  };

  const finish = async () => {
    submitting.value = true;

    try {
      await createAvailabilitySlots();

      const onboardingResponse = await usersApi.completeOnboarding(apiClient);

      auth.setUser(onboardingResponse.user);
      await navigateTo(auth.getAuthenticatedHomePath());
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to finish onboarding. Please try again."),
      );
    } finally {
      submitting.value = false;
    }
  };

  const next = async () => {
    if (!canContinue.value || submitting.value) return;
    if (stepIndex.value === STEPS.length - 1) return finish();

    if (step.value.id === "profile") {
      const saved = await saveProfile();
      if (!saved) return;
    }

    direction.value = 1;
    stepIndex.value++;
  };

  const back = () => {
    if (stepIndex.value === 0) return;
    direction.value = -1;
    stepIndex.value--;
  };

  const applyUserProfile = () => {
    const user = auth.user.value;

    if (user?.name) {
      profile.name = user.name;
    }

    if (user?.username) {
      profile.username = user.username;
      usernameStatus.value = "available";
    }
  };

  const loadProfile = async () => {
    if (!auth.token.value) {
      return;
    }

    try {
      const response = await usersApi.me(apiClient);
      auth.setUser(response.user);
      applyUserProfile();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to load your profile details."),
      );
    }
  };

  onMounted(() => {
    timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    applyUserProfile();
    void loadProfile();
  });

  onBeforeUnmount(() => {
    clearTimeout(checkTimer);
  });

  return reactive({
    stepIndex,
    step,
    direction,
    submitting,
    timezone,
    profile,
    avatarError,
    usernameStatus,
    usernameError,

    calendar,
    connectCalendar,
    availability,
    dayErrors,
    availabilityError,
    toggleDay,
    addRange,
    removeRange,
    updateRange,
    copyDay,
    canContinue,
    next,
    back,
  });
};

export type Onboarding = ReturnType<typeof useOnboarding>;

export const ONBOARDING_KEY = Symbol("onboarding") as InjectionKey<Onboarding>;

export const useOnboardingContext = () => {
  const onboarding = inject(ONBOARDING_KEY);

  if (!onboarding) {
    throw new Error("Onboarding context is missing.");
  }

  return onboarding;
};
