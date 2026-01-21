/**
 * CAREERS ROUTES
 * Handles job applications from /careers page
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JobApplication } from '../models/JobApplication.js';
import { notifyAdminJobApplication } from '../services/email.js';

const router = express.Router();

/**
 * Submit a job application
 */
router.post('/applications', async (req, res) => {
  try {
    const {
      position,
      applicant,
      userId,
      resume,
      coverLetter,
      responses,
      experience,
      compensation,
      availability,
      source,
    } = req.body;

    if (
      !position?.id ||
      !applicant?.email ||
      !applicant?.firstName ||
      !applicant?.lastName
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicate application
    const existing = await JobApplication.findOne({
      'applicant.email': applicant.email,
      'position.id': position.id,
    });

    if (existing) {
      return res.status(400).json({
        error: 'You have already applied for this position',
        applicationId: existing.applicationId,
      });
    }

    const application = new JobApplication({
      applicationId: `app_${Date.now()}_${uuidv4().slice(0, 8)}`,
      position,
      applicant,
      userId,
      resume,
      coverLetter,
      responses,
      experience,
      compensation,
      availability,
      source,
      status: 'submitted',
    });

    await application.save();

    // Send admin notification email
    notifyAdminJobApplication({
      position: position.title || position.id,
      applicantName: `${applicant.firstName} ${applicant.lastName}`,
      applicantEmail: applicant.email,
      phone: applicant.phone,
      applicationId: application.applicationId,
      applicationNumber: application.applicationNumber,
    }).catch((err) => console.error('Failed to send admin notification:', err));

    res.json({
      success: true,
      application: {
        applicationId: application.applicationId,
        applicationNumber: application.applicationNumber,
        status: application.status,
        appliedAt: application.appliedAt,
      },
      message: 'Application submitted successfully. We will review it shortly!',
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

/**
 * Get user's applications
 */
router.get('/applications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const applications = await JobApplication.find({ userId })
      .select(
        'applicationId applicationNumber position status appliedAt lastActivityAt'
      )
      .sort({ appliedAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * Get application by email (for non-logged-in users)
 */
router.get('/applications/email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const applications = await JobApplication.find({ 'applicant.email': email })
      .select(
        'applicationId applicationNumber position status appliedAt lastActivityAt'
      )
      .sort({ appliedAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * Get application details
 */
router.get('/applications/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findOne({ applicationId });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Remove sensitive internal data for applicant view
    const safeApplication = {
      applicationId: application.applicationId,
      applicationNumber: application.applicationNumber,
      position: application.position,
      applicant: application.applicant,
      status: application.status,
      appliedAt: application.appliedAt,
      interviews: application.interviews?.filter(
        (i) => i.status === 'scheduled'
      ),
    };

    res.json({ success: true, application: safeApplication });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

/**
 * Withdraw application
 */
router.post('/applications/:applicationId/withdraw', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findOne({ applicationId });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (['hired', 'withdrawn', 'rejected'].includes(application.status)) {
      return res
        .status(400)
        .json({ error: 'Cannot withdraw this application' });
    }

    application.status = 'withdrawn';
    application.closedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

export default router;
