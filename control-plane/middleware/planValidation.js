const subscriptionService = require('../services/subscriptionService');

/**
 * Middleware to check if user can create a new stream source
 */
const canCreateSource = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const canCreate = await subscriptionService.canCreateSource(userId);

    if (!canCreate.allowed) {
      return res.status(403).json({
        error: 'Source limit exceeded',
        message: `You have reached the maximum number of sources allowed by your plan (${canCreate.current}/${canCreate.max})`,
        current: canCreate.current,
        limit: canCreate.max,
        upgrade_url: '/billing/upgrade',
        code: 'SOURCE_LIMIT_EXCEEDED'
      });
    }

    req.planLimits = { canCreateSource: canCreate };
    next();
  } catch (error) {
    console.error('Plan validation error (source creation):', error);
    res.status(500).json({ error: 'Failed to validate plan limits' });
  }
};

/**
 * Middleware to check if user can create a new destination
 */
const canCreateDestination = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const canCreate = await subscriptionService.canCreateDestination(userId);

    if (!canCreate.allowed) {
      return res.status(403).json({
        error: 'Destination limit exceeded',
        message: `You have reached the maximum number of destinations allowed by your plan (${canCreate.current}/${canCreate.max})`,
        current: canCreate.current,
        limit: canCreate.max,
        upgrade_url: '/billing/upgrade',
        code: 'DESTINATION_LIMIT_EXCEEDED'
      });
    }

    req.planLimits = { canCreateDestination: canCreate };
    next();
  } catch (error) {
    console.error('Plan validation error (destination creation):', error);
    res.status(500).json({ error: 'Failed to validate plan limits' });
  }
};

/**
 * Middleware to check if user can start streaming
 */
const canStream = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const canStream = await subscriptionService.canStream(userId);

    if (!canStream.allowed) {
      return res.status(403).json({
        error: 'Streaming hour limit exceeded',
        message: `You have reached your monthly streaming hour limit (${canStream.current.toFixed(1)}/${canStream.max} hours)`,
        current: canStream.current,
        limit: canStream.max,
        upgrade_url: '/billing/upgrade',
        code: 'STREAMING_HOURS_EXCEEDED'
      });
    }

    req.planLimits = { canStream };
    next();
  } catch (error) {
    console.error('Plan validation error (streaming):', error);
    res.status(500).json({ error: 'Failed to validate streaming allowance' });
  }
};

/**
 * Middleware to get user's current plan and usage
 */
const getUserPlanInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const usage = await subscriptionService.getUserUsage(userId);

    req.userPlan = usage;
    next();
  } catch (error) {
    console.error('Error getting user plan info:', error);
    // Don't block the request, just continue without plan info
    req.userPlan = null;
    next();
  }
};

/**
 * Middleware to check if user has specific feature
 */
const hasFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const usage = await subscriptionService.getUserUsage(userId);

      const hasFeature = usage.features && usage.features[feature];

      if (!hasFeature) {
        return res.status(403).json({
          error: 'Feature not available',
          message: `The feature "${feature}" is not available in your current plan`,
          upgrade_url: '/billing/upgrade',
          code: 'FEATURE_NOT_AVAILABLE'
        });
      }

      next();
    } catch (error) {
      console.error('Feature check error:', error);
      res.status(500).json({ error: 'Failed to check feature availability' });
    }
  };
};

module.exports = {
  canCreateSource,
  canCreateDestination,
  canStream,
  getUserPlanInfo,
  hasFeature
};