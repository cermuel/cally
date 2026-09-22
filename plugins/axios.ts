import axios from 'axios'

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: '/',
    headers: {
      Accept: 'application/json',
    },
  })

  return {
    provide: {
      axios: api,
    },
  }
})
