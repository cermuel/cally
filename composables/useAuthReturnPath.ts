import { isSafeAuthReturnPath } from "~/utils/auth-redirect";

const authReturnPathKey = "cally-auth-return-path";

export const useAuthReturnPath = () => {
  const clear = (path?: string) => {
    if (!import.meta.client) return;
    if (path && localStorage.getItem(authReturnPathKey) !== path) return;

    localStorage.removeItem(authReturnPathKey);
  };

  const remember = (path: string) => {
    if (!import.meta.client || !isSafeAuthReturnPath(path)) return;
    localStorage.setItem(authReturnPathKey, path);
  };

  const peek = (fallback: string) => {
    if (!import.meta.client) return fallback;

    const path = localStorage.getItem(authReturnPathKey);
    return isSafeAuthReturnPath(path) ? path : fallback;
  };

  const take = (fallback: string) => {
    const path = peek(fallback);

    clear();

    return path;
  };

  return { clear, remember, peek, take };
};
