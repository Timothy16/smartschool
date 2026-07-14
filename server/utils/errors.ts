export function toUserError(error: any) {
  // A known error we threw on purpose - has a statusCode < 500 and a safe message.
  if (error?.statusCode && error.statusCode < 500) return error

  // Map common Mongoose/Mongo errors to human messages (no field paths leaked).
  if (error?.code === 11000) {
    return createError({ statusCode: 409, message: 'A record with these details already exists.' })
  }
  if (error?.name === 'ValidationError') {
    return createError({ statusCode: 400, message: 'Some details are missing or invalid. Please check and try again.' })
  }
  if (error?.name === 'CastError') {
    return createError({ statusCode: 400, message: 'That request was invalid.' })
  }

  // Anything unexpected: never leak it.
  return createError({ statusCode: 500, message: 'Something went wrong. Please try again.' })
}
