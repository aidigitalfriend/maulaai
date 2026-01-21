import { ObjectId } from 'mongodb'

export interface User {
  email: string
  name?: string
  password?: string // Optional for passwordless users
  authMethod: 'password' | 'passwordless'
  emailVerified?: Date
  image?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
  role: 'user' | 'admin' | 'moderator'
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export default User
