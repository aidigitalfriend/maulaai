import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// SUBSCRIPTION CHANGES MODEL
// ============================================
const subscriptionChangesSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Change Information
    changeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    changeType: {
      type: String,
      enum: [
        'upgrade',
        'downgrade',
        'addon_added',
        'addon_removed',
        'plan_switch',
        'cancellation',
        'reactivation',
        'pause',
        'resume',
        'feature_toggle',
        'billing_cycle_change',
        'payment_method_change',
        'quantity_change',
        'customization',
      ],
      required: true,
      index: true,
    },

    // Change Details
    change: {
      // Previous State
      from: {
        subscriptionId: String,
        planId: String,
        planName: String,
        planType: String,
        billingCycle: String, // 'monthly', 'yearly', 'quarterly'
        price: Number,
        currency: String,
        features: [String],
        limits: {
          conversations: Number,
          messages: Number,
          apiCalls: Number,
          storage: Number, // in GB
          agents: Number,
          customFeatures: [
            {
              name: String,
              value: String,
            },
          ],
        },
        addons: [
          {
            addonId: String,
            addonName: String,
            price: Number,
            features: [String],
          },
        ],
        status: String,
      },

      // New State
      to: {
        subscriptionId: String,
        planId: String,
        planName: String,
        planType: String,
        billingCycle: String,
        price: Number,
        currency: String,
        features: [String],
        limits: {
          conversations: Number,
          messages: Number,
          apiCalls: Number,
          storage: Number,
          agents: Number,
          customFeatures: [
            {
              name: String,
              value: String,
            },
          ],
        },
        addons: [
          {
            addonId: String,
            addonName: String,
            price: Number,
            features: [String],
          },
        ],
        status: String,
      },
    },

    // Timing Information
    timing: {
      requestedDate: {
        type: Date,
        default: Date.now,
        index: true,
      },
      effectiveDate: {
        type: Date,
        required: true,
        index: true,
      },
      processedDate: Date,
      completedDate: Date,

      // Prorated billing information
      proration: {
        isProrated: {
          type: Boolean,
          default: false,
        },
        previousPeriodEnd: Date,
        newPeriodStart: Date,
        proratedAmount: Number,
        creditAmount: Number,
        chargeAmount: Number,
        adjustmentDescription: String,
      },
    },

    // Financial Impact
    financialImpact: {
      // Immediate charges/credits
      immediateCharge: {
        type: Number,
        default: 0,
      },
      immediateCredit: {
        type: Number,
        default: 0,
      },
      netImmediate: {
        type: Number,
        default: 0,
      },

      // Monthly recurring changes
      monthlyChange: {
        type: Number,
        default: 0, // positive for increases, negative for decreases
      },

      // Annual impact
      annualImpact: {
        type: Number,
        default: 0,
      },

      // Savings/costs breakdown
      breakdown: [
        {
          component: String, // 'base_plan', 'addon', 'feature', etc.
          previousCost: Number,
          newCost: Number,
          difference: Number,
          description: String,
        },
      ],

      // Currency
      currency: {
        type: String,
        default: 'USD',
      },
    },

    // Change Reason and Context
    reason: {
      category: {
        type: String,
        enum: [
          'user_request',
          'usage_exceeded',
          'cost_optimization',
          'feature_requirement',
          'business_growth',
          'budget_constraints',
          'payment_failure',
          'admin_action',
          'system_migration',
          'compliance',
          'other',
        ],
        required: true,
      },
      description: String,
      userInitiated: {
        type: Boolean,
        default: true,
      },
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
    },

    // Approval Process
    approval: {
      required: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'auto_approved'],
        default: 'auto_approved',
      },
      approvedBy: {
        userId: mongoose.Schema.Types.ObjectId,
        userEmail: String,
        userRole: String,
        approvedDate: Date,
      },
      rejectedBy: {
        userId: mongoose.Schema.Types.ObjectId,
        userEmail: String,
        userRole: String,
        rejectedDate: Date,
        reason: String,
      },
      approvalNotes: String,
    },

    // Change Execution
    execution: {
      status: {
        type: String,
        enum: [
          'pending',
          'scheduled',
          'in_progress',
          'completed',
          'failed',
          'cancelled',
          'rolled_back',
        ],
        default: 'pending',
        index: true,
      },

      steps: [
        {
          stepId: String,
          stepName: String,
          status: String,
          startTime: Date,
          endTime: Date,
          duration: Number, // milliseconds
          error: String,
          retries: Number,
          metadata: {
            type: Map,
            of: String,
          },
        },
      ],

      totalDuration: Number, // milliseconds
      errorDetails: String,
      rollbackReason: String,
    },

    // User Experience
    userExperience: {
      // Notification preferences
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        inApp: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },

      // Notifications sent
      notificationsSent: [
        {
          type: String, // 'confirmation', 'processing', 'completed', 'failed'
          channel: String, // 'email', 'sms', 'in_app', 'webhook'
          sentDate: Date,
          status: String,
          messageId: String,
        },
      ],

      // User feedback
      feedback: {
        satisfaction: {
          type: Number,
          min: 1,
          max: 5,
        },
        experience: {
          type: String,
          enum: ['poor', 'fair', 'good', 'very_good', 'excellent'],
        },
        comments: String,
        submittedDate: Date,
      },
    },

    // Integration and External Systems
    integrations: {
      // Payment processor updates
      paymentProcessor: {
        subscriptionId: String,
        customerId: String,
        status: String,
        lastSyncDate: Date,
        syncErrors: [String],
      },

      // Billing system updates
      billingSystem: {
        invoiceId: String,
        adjustmentId: String,
        status: String,
        lastSyncDate: Date,
      },

      // CRM updates
      crm: {
        accountId: String,
        opportunityId: String,
        status: String,
        lastSyncDate: Date,
      },

      // Analytics tracking
      analytics: {
        eventId: String,
        tracked: Boolean,
        trackedDate: Date,
      },
    },

    // Usage Impact Analysis
    usageImpact: {
      // Before change usage patterns
      beforeChange: {
        averageUsage: {
          conversations: Number,
          messages: Number,
          apiCalls: Number,
          storage: Number,
        },
        peakUsage: {
          conversations: Number,
          messages: Number,
          apiCalls: Number,
          storage: Number,
        },
        utilizationRate: Number, // percentage
      },

      // Expected impact
      expectedImpact: {
        usageIncrease: Number, // percentage
        newUtilizationRate: Number,
        additionalCapacity: {
          conversations: Number,
          messages: Number,
          apiCalls: Number,
          storage: Number,
        },
      },

      // Actual impact (measured post-change)
      actualImpact: {
        usageChange: Number, // percentage
        newUtilizationRate: Number,
        capacityUtilized: Number, // percentage
        measuredDate: Date,
      },
    },

    // Compliance and Audit
    compliance: {
      dataRetention: {
        required: Boolean,
        period: Number, // days
        reason: String,
      },

      auditTrail: [
        {
          action: String,
          performedBy: {
            userId: mongoose.Schema.Types.ObjectId,
            userEmail: String,
            userRole: String,
          },
          timestamp: Date,
          details: String,
          ipAddress: String,
          userAgent: String,
        },
      ],

      regulatory: {
        gdprCompliant: Boolean,
        ccpaCompliant: Boolean,
        soxCompliant: Boolean,
        customCompliance: [
          {
            regulation: String,
            compliant: Boolean,
            notes: String,
          },
        ],
      },
    },

    // Analytics and Metrics
    analytics: {
      // Change success metrics
      success: {
        userSatisfaction: Number,
        adoptionRate: Number, // percentage of new features used
        timeToValue: Number, // days until user sees value
        supportTickets: Number, // related to this change
      },

      // Business metrics
      business: {
        revenueImpact: Number,
        churnRisk: {
          before: Number,
          after: Number,
          change: Number,
        },
        lifetimeValue: {
          before: Number,
          projected: Number,
        },
        netPromoterScore: {
          before: Number,
          after: Number,
        },
      },
    },

    // Related Changes
    relatedChanges: [
      {
        changeId: String,
        relationship: String, // 'caused_by', 'caused', 'related_to'
        description: String,
      },
    ],

    // Metadata
    metadata: {
      source: {
        type: String,
        enum: ['dashboard', 'api', 'admin_panel', 'support', 'automation'],
        default: 'dashboard',
      },
      clientVersion: String,
      requestId: String,
      sessionId: String,
      userAgent: String,
      ipAddress: String,
      customData: {
        type: Map,
        of: String,
      },
    },
  },
  {
    timestamps: true,
    collection: 'subscriptionchanges',
  }
);

// Compound indexes for performance
subscriptionChangesSchema.index({ userId: 1, 'timing.requestedDate': -1 });
subscriptionChangesSchema.index({
  userId: 1,
  changeType: 1,
  'timing.effectiveDate': -1,
});
subscriptionChangesSchema.index({
  'execution.status': 1,
  'timing.effectiveDate': 1,
});

// Single field indexes
subscriptionChangesSchema.index({ userId: 1 });
subscriptionChangesSchema.index({ changeId: 1 }, { unique: true });
subscriptionChangesSchema.index({ changeType: 1 });
subscriptionChangesSchema.index({ 'timing.requestedDate': -1 });
subscriptionChangesSchema.index({ 'timing.effectiveDate': 1 });
subscriptionChangesSchema.index({ 'execution.status': 1 });

// Static method to get subscription changes for user
subscriptionChangesSchema.statics.getChangesForUser = async function (
  userId,
  options = {}
) {
  const {
    changeType,
    startDate,
    endDate,
    status,
    limit = 50,
    skip = 0,
  } = options;

  const query = { userId };

  if (changeType) query.changeType = changeType;
  if (status) query['execution.status'] = status;
  if (startDate || endDate) {
    query['timing.requestedDate'] = {};
    if (startDate) query['timing.requestedDate'].$gte = startDate;
    if (endDate) query['timing.requestedDate'].$lte = endDate;
  }

  return this.find(query)
    .sort({ 'timing.requestedDate': -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get pending changes
subscriptionChangesSchema.statics.getPendingChanges = async function (
  effectiveBefore = null
) {
  const query = {
    'execution.status': { $in: ['pending', 'scheduled'] },
  };

  if (effectiveBefore) {
    query['timing.effectiveDate'] = { $lte: effectiveBefore };
  }

  return this.find(query)
    .sort({ 'timing.effectiveDate': 1 })
    .populate('userId', 'email name');
};

// Static method to get change analytics
subscriptionChangesSchema.statics.getChangeAnalytics = async function (
  startDate,
  endDate,
  options = {}
) {
  const { groupBy = 'changeType' } = options;

  const pipeline = [
    {
      $match: {
        'timing.requestedDate': { $gte: startDate, $lte: endDate },
        'execution.status': 'completed',
      },
    },
    {
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 },
        averageImpact: { $avg: '$financialImpact.monthlyChange' },
        totalImpact: { $sum: '$financialImpact.monthlyChange' },
        averageSatisfaction: { $avg: '$userExperience.feedback.satisfaction' },
      },
    },
    {
      $sort: { count: -1 },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate financial impact
subscriptionChangesSchema.methods.calculateFinancialImpact = function () {
  const fromPrice = this.change.from.price || 0;
  const toPrice = this.change.to.price || 0;

  const monthlyChange = toPrice - fromPrice;
  const annualImpact = monthlyChange * 12;

  // Handle prorated charges
  let immediateCharge = 0;
  let immediateCredit = 0;

  if (this.timing.proration.isProrated) {
    immediateCharge = this.timing.proration.chargeAmount || 0;
    immediateCredit = this.timing.proration.creditAmount || 0;
  }

  this.financialImpact = {
    immediateCharge,
    immediateCredit,
    netImmediate: immediateCharge - immediateCredit,
    monthlyChange,
    annualImpact,
    currency: this.change.to.currency || 'USD',
  };

  return this.financialImpact;
};

// Method to add execution step
subscriptionChangesSchema.methods.addExecutionStep = function (
  stepName,
  status = 'pending'
) {
  const step = {
    stepId: new mongoose.Types.ObjectId().toString(),
    stepName,
    status,
    startTime: new Date(),
    retries: 0,
  };

  this.execution.steps.push(step);
  return step;
};

// Method to update execution step
subscriptionChangesSchema.methods.updateExecutionStep = function (
  stepId,
  updates
) {
  const step = this.execution.steps.find((s) => s.stepId === stepId);
  if (step) {
    Object.assign(step, updates);
    if (updates.status === 'completed' && !step.endTime) {
      step.endTime = new Date();
      step.duration = step.endTime - step.startTime;
    }
  }
  return step;
};

// Method to process change execution
subscriptionChangesSchema.methods.executeChange = async function () {
  this.execution.status = 'in_progress';
  this.timing.processedDate = new Date();

  try {
    // Add execution steps based on change type
    const steps = this.getExecutionSteps();

    for (const stepName of steps) {
      const step = this.addExecutionStep(stepName, 'in_progress');

      try {
        // Execute step logic here (would be implemented in service layer)
        await this.executeStep(stepName);
        this.updateExecutionStep(step.stepId, { status: 'completed' });
      } catch (error) {
        this.updateExecutionStep(step.stepId, {
          status: 'failed',
          error: error.message,
        });
        throw error;
      }
    }

    this.execution.status = 'completed';
    this.timing.completedDate = new Date();
  } catch (error) {
    this.execution.status = 'failed';
    this.execution.errorDetails = error.message;
  }

  const totalDuration = this.timing.completedDate - this.timing.processedDate;
  this.execution.totalDuration = totalDuration;
};

// Method to get execution steps based on change type
subscriptionChangesSchema.methods.getExecutionSteps = function () {
  const stepMap = {
    upgrade: [
      'validate_payment',
      'update_subscription',
      'apply_features',
      'send_confirmation',
    ],
    downgrade: [
      'validate_limits',
      'update_subscription',
      'remove_features',
      'send_confirmation',
    ],
    cancellation: [
      'validate_cancellation',
      'process_refunds',
      'disable_features',
      'send_confirmation',
    ],
    addon_added: [
      'validate_payment',
      'enable_addon',
      'update_billing',
      'send_confirmation',
    ],
    addon_removed: ['disable_addon', 'update_billing', 'send_confirmation'],
  };

  return (
    stepMap[this.changeType] || ['update_subscription', 'send_confirmation']
  );
};

// Virtual for change summary
subscriptionChangesSchema.virtual('changeSummary').get(function () {
  return {
    type: this.changeType,
    from: `${this.change.from.planName} (${this.change.from.price})`,
    to: `${this.change.to.planName} (${this.change.to.price})`,
    impact: this.financialImpact.monthlyChange,
    status: this.execution.status,
    effectiveDate: this.timing.effectiveDate,
  };
});

// Virtual for days until effective
subscriptionChangesSchema.virtual('daysUntilEffective').get(function () {
  const today = new Date();
  const effective = this.timing.effectiveDate;

  if (effective > today) {
    return Math.ceil((effective - today) / (1000 * 60 * 60 * 24));
  }

  return 0;
});

export default mongoose.model('SubscriptionChanges', subscriptionChangesSchema);
