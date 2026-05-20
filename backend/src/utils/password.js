import bcrypt from 'bcryptjs'

const saltRounds = 10

export const hashPassword = (password) => bcrypt.hash(password, saltRounds)
export const comparePassword = (password, hash) => bcrypt.compare(password, hash)
