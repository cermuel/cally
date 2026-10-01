import { toast } from 'vue-sonner'

export const useGoogleCalendar = () => {
  const route = useRoute()
  const googleOAuth = useGoogleOAuth()
  const calendar = reactive({
    connected: route.query.google === 'connected',
    connecting: false,
  })

  const connect = async (returnPath: string) => {
    calendar.connecting = true
    await googleOAuth.connectCalendar(returnPath)

    if (!googleOAuth.pending.value) {
      calendar.connecting = false
    }
  }

  onMounted(() => {
    if (calendar.connected) {
      toast.success('Google Calendar connected.')
    }
  })

  return {
    calendar,
    connect,
  }
}
