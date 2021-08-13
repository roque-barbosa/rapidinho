export const validateregistrationNumber = (registrationNumber: string) => {
  const regularExpression = /^[A-Z]{2}-[0-9]{4}$/
  return regularExpression.test(registrationNumber)
}