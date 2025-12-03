import { ObjectId } from 'mongodb'

export interface JobApplication {
  position: string
  jobId: string
  fullName: string
  email: string
  contactNumber: string
  address: string
  age: number
  currentPosition: string
  yearsExperience: string
  expertise: string[]
  workHistory: Array<{
    company: string
    position: string
    duration: string
    description: string
  }>
  portfolioUrl?: string
  additionalInfo?: string
  expectations?: string
  resumeUrl?: string
  coverLetterUrl?: string
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewNotes?: string
  ipAddress: string
  userAgent: string
  applicationId: string
  createdAt: Date
  updatedAt: Date
}

export default JobApplication
