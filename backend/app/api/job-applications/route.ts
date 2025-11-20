import { NextRequest, NextResponse } from 'next/server'

interface JobApplication {
  position: string
  jobId: string
  fullName: string
  email: string
  contactNumber: string
  address: string
  age: string
  currentPosition: string
  yearsExperience: string
  expertise: string[]
  workHistory: Array<{
    company: string
    position: string
    duration: string
    description: string
  }>
  portfolioUrl: string
  additionalInfo: string
  expectations: string
  resumeFile?: File
  coverLetterFile?: File
  submittedAt: string
  ipAddress: string
  userAgent: string
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP and user agent for audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      request.ip || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Parse form data
    const formData = await request.formData()

    // Extract fields
    const position = formData.get('position') as string
    const jobId = formData.get('jobId') as string
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const contactNumber = formData.get('contactNumber') as string
    const address = formData.get('address') as string
    const age = formData.get('age') as string
    const currentPosition = formData.get('currentPosition') as string
    const yearsExperience = formData.get('yearsExperience') as string
    const expertise = JSON.parse(formData.get('expertise') as string || '[]')
    const workHistory = JSON.parse(formData.get('workHistory') as string || '[]')
    const portfolioUrl = formData.get('portfolioUrl') as string
    const additionalInfo = formData.get('additionalInfo') as string
    const expectations = formData.get('expectations') as string
    const resumeFile = formData.get('resume') as File | null
    const coverLetterFile = formData.get('coverLetter') as File | null

    // Validation
    if (!position?.trim()) {
      return NextResponse.json(
        { message: 'Position is required' },
        { status: 400 }
      )
    }

    if (!fullName?.trim()) {
      return NextResponse.json(
        { message: 'Full name is required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email?.trim() || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!contactNumber?.trim()) {
      return NextResponse.json(
        { message: 'Contact number is required' },
        { status: 400 }
      )
    }

    if (!address?.trim()) {
      return NextResponse.json(
        { message: 'Address is required' },
        { status: 400 }
      )
    }

    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 18) {
      return NextResponse.json(
        { message: 'Age must be 18 or older' },
        { status: 400 }
      )
    }

    if (!currentPosition?.trim()) {
      return NextResponse.json(
        { message: 'Current position is required' },
        { status: 400 }
      )
    }

    if (!yearsExperience) {
      return NextResponse.json(
        { message: 'Years of experience is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(expertise) || expertise.length === 0) {
      return NextResponse.json(
        { message: 'At least one area of expertise is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(workHistory) || workHistory.length === 0) {
      return NextResponse.json(
        { message: 'Work history is required' },
        { status: 400 }
      )
    }

    // Validate work history entries
    for (const history of workHistory) {
      if (!history.company?.trim() || !history.position?.trim() || !history.duration?.trim()) {
        return NextResponse.json(
          { message: 'All work history fields must be filled' },
          { status: 400 }
        )
      }
    }

    if (!resumeFile) {
      return NextResponse.json(
        { message: 'Resume file is required' },
        { status: 400 }
      )
    }

    // Validate file sizes (max 5MB)
    const maxFileSize = 5 * 1024 * 1024 // 5MB
    if (resumeFile.size > maxFileSize) {
      return NextResponse.json(
        { message: 'Resume file size must not exceed 5MB' },
        { status: 400 }
      )
    }

    if (coverLetterFile && coverLetterFile.size > maxFileSize) {
      return NextResponse.json(
        { message: 'Cover letter file size must not exceed 5MB' },
        { status: 400 }
      )
    }

    // Create application object
    const application: JobApplication = {
      position,
      jobId,
      fullName,
      email,
      contactNumber,
      address,
      age,
      currentPosition,
      yearsExperience,
      expertise,
      workHistory,
      portfolioUrl: portfolioUrl || '',
      additionalInfo: additionalInfo || '',
      expectations: expectations || '',
      submittedAt: new Date().toISOString(),
      ipAddress,
      userAgent
    }

    // TODO: In production, you would:
    // 1. Save to database
    // 2. Save files to cloud storage
    // 3. Send confirmation email
    // 4. Send notification to HR
    // 5. Add to CRM

    // For now, just log and return success
    console.log('Job Application Received:', {
      position,
      email,
      name: fullName,
      timestamp: new Date().toISOString()
    })

    // Simulate sending emails
    console.log(`Confirmation email would be sent to: ${email}`)
    console.log(`HR notification would be sent for: ${position} position`)

    return NextResponse.json(
      {
        message: 'Application submitted successfully',
        applicationId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        position
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Job Application Error:', error)
    return NextResponse.json(
      {
        message: 'Failed to process application. Please try again later.'
      },
      { status: 500 }
    )
  }
}
