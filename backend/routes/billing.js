/**
 * BILLING ROUTES
 * Handles transactions, invoices, and payment history
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../models/Transaction.js';
import {
  trackTransaction,
  updateTransactionStatus,
} from '../lib/analytics-tracker.js';

const router = express.Router();

// ============================================
// TRANSACTIONS
// ============================================

/**
 * Record a new transaction
 */
router.post('/transactions', async (req, res) => {
  try {
    const {
      userId,
      stripePaymentIntentId,
      stripeInvoiceId,
      stripeChargeId,
      type,
      amount,
      currency,
      status,
      description,
      items,
      subscription,
      payment,
      billing,
      invoiceUrl,
      receiptUrl,
      metadata,
    } = req.body;

    if (!userId || !type || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = await trackTransaction({
      transactionId: `txn_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      stripePaymentIntentId,
      stripeInvoiceId,
      stripeChargeId,
      type,
      amount,
      currency: currency || 'usd',
      status: status || 'pending',
      description,
      items,
      subscription,
      payment,
      billing,
      invoiceUrl,
      receiptUrl,
      metadata,
    });

    res.json({
      success: true,
      transaction: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

/**
 * Get user's transaction history
 */
router.get('/transactions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, status, page = 1, limit = 20 } = req.query;

    const filter = { userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .select(
        'transactionId type amount currency status description invoiceUrl receiptUrl createdAt',
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    // Calculate totals
    const totals = await Transaction.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      transactions,
      totals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * Get transaction details
 */
router.get('/transactions/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ transactionId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

/**
 * Update transaction status (for webhooks)
 */
router.patch('/transactions/:transactionId/status', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, ...additionalData } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const transaction = await updateTransactionStatus(
      transactionId,
      status,
      additionalData,
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction: {
        transactionId: transaction.transactionId,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

/**
 * Get user's billing summary
 */
router.get('/billing/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get this month's transactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlySpend = await Transaction.aggregate([
      {
        $match: {
          userId,
          status: 'completed',
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get all-time stats
    const allTimeStats = await Transaction.aggregate([
      {
        $match: {
          userId,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .select('transactionId type amount status description createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      summary: {
        monthlySpend: monthlySpend[0]?.total || 0,
        monthlyTransactions: monthlySpend[0]?.count || 0,
        allTimeStats,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Error fetching billing summary:', error);
    res.status(500).json({ error: 'Failed to fetch billing summary' });
  }
});

export default router;
