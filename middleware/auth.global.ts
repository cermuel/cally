export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()
  const isAuthRoute = to.path === '/auth' || to.path.startsWith('/auth/')
  const isAppRoute = to.path === '/app' || to.path.startsWith('/app/')

  if (isAuthRoute && auth.token.value) {
    return navigateTo(auth.getAuthenticatedHomePath(), { replace: true })
  }

  if (!isAppRoute) {
    return
  }

  if (!auth.token.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    }, { replace: true })
  }

  if (auth.authState.value === 'needs_onboarding' && to.path !== '/app/onboarding') {
    return navigateTo('/app/onboarding', { replace: true })
  }

  if (auth.authState.value === 'authenticated' && to.path === '/app/onboarding') {
    return navigateTo('/app/bookings', { replace: true })
  }
})
