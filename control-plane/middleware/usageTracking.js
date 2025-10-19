const subscriptionService = require('../services/subscription');

/**
 * Middleware to check if user can create more stream sources
 */
const canCreateStreamSource = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const canCreate = await subscriptionService.canCreateStreamSource(req.user.id);

    if (!canCreate) {
      return res.status(403).json({
        error: 'Stream source limit reached',
        message: 'You have reached the maximum number of stream sources allowed by your plan. Please upgrade to create more sources.'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking stream source limit:', error);
    res.status(500).json({ error: 'Failed to check plan limits' });
  }
};

/**
 * Middleware to check if user can add more destinations
 */
const canAddDestination = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const canAdd = await subscriptionService.canAddDestination(req.user.id);

    if (!canAdd) {
      return res.status(403).json({
        error: 'Destination limit reached',
        message: 'You have reached the maximum number of destinations allowed by your plan. Please upgrade to add more destinations.'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking destination limit:', error);
    res.status(500).json({ error: 'Failed to check plan limits' });
  }
};

/**
 * Middleware to update usage metrics after successful operations
 */
const updateUsageMetrics = async (req, res, next) => {
  // Store the original send method
  const originalSend = res.send;

  // Override the send method to update usage after response
  res.send = async function(data) {
    // Only update usage for successful operations
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      try {
        // Get current usage
        const currentUsage = await subscriptionService.getUserUsage(req.user.id);

        // Update usage based on the operation
        if (req.method === 'POST' && req.path.includes('/sources')) {
          await subscriptionService.updateUsage(req.user.id, {
            active_stream_sources: currentUsage.active_stream_sources + 1
          });
        } else if (req.method === 'POST' && req.path.includes('/destinations')) {
          await subscriptionService.updateUsage(req.user.id, {
            total_destinations: currentUsage.total_destinations + 1
          });
        } else if (req.method === 'DELETE' && req.path.includes('/sources')) {
          await subscriptionService.updateUsage(req.user.id, {
            active_stream_sources: Math.max(0, currentUsage.active_stream_sources - 1)
          });
        } else if (req.method === 'DELETE' && req.path.includes('/destinations')) {
          await subscriptionService.updateUsage(req.user.id, {
            total_destinations: Math.max(0, currentUsage.total_destinations - 1)
          });
        }
      } catch (error) {
        console.error('Error updating usage metrics:', error);
        // Don't fail the request if usage update fails
      }
    }

    // Call the original send method
    originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware to check streaming hours limit
 */
const checkStreamingHours = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  try {
    const subscription = await subscriptionService.getUserSubscription(req.user.id);
    const usage = await subscriptionService.getUserUsage(req.user.id);

    const maxHours = subscription?.max_streaming_hours_monthly || 50; // Free plan default

    if (usage.streaming_hours_used >= maxHours) {
      return res.status(403).json({
        error: 'Streaming hours limit reached',
        message: `You have reached your monthly streaming limit of ${maxHours} hours. Please upgrade to continue streaming.`
      });
    }

    next();
  } catch (error) {
    console.error('Error checking streaming hours:', error);
    next(); // Don't block streaming if check fails
  }
};

module.exports = {
  canCreateStreamSource,
  canAddDestination,
  updateUsageMetrics,
  checkStreamingHours
};