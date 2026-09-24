const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateEmail = (email: string) => {
  return emailPattern.test(email.trim())
}

const validateRequired = (value: string) => {
  return value.trim().length > 0
}

const validateMinLength = (value: string, minLength: number) => {
  return value.length >= minLength
}

const validateConfirmed = (value: string, confirmation: string) => {
  return value === confirmation
}

export const helpers = {
  validateConfirmed,
  validateEmail,
  validateMinLength,
  validateRequired,
}
