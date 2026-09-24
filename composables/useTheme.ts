export type Theme = 'dark' | 'light'

const themeStorageKey = 'cally-theme'
const defaultTheme: Theme = 'dark'

const isTheme = (value: string | null): value is Theme => {
  return value === 'dark' || value === 'light'
}

const applyTheme = (theme: Theme) => {
  if (!import.meta.client) {
    return
  }

  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme

  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#171717' : '#ffffff')
}

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => defaultTheme)

  const setTheme = (nextTheme: Theme) => {
    theme.value = nextTheme

    if (import.meta.client) {
      localStorage.setItem(themeStorageKey, nextTheme)
      applyTheme(nextTheme)
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const initTheme = () => {
    if (!import.meta.client) {
      return
    }

    const savedTheme = localStorage.getItem(themeStorageKey)
    setTheme(isTheme(savedTheme) ? savedTheme : defaultTheme)
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    initTheme,
  }
}
