import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'change-me'
const expiresIn = process.env.JWT_EXPIRES_IN || '8h'

export const signToken = (payload) => jwt.sign(payload, secret, { expiresIn })

export const verifyToken = (token) => jwt.verify(token, secret)
