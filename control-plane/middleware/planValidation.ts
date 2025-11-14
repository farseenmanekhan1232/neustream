import { Request, Response, NextFunction } from 'express';
import {
  CanCreateSourceResult,
  CanCreateDestinationResult,
  CanStreamResult,
  CanCreateChatConnectorResult,
  UserUsage
} from '../types/entities';
import subscriptionService from '../services/subscriptionService';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      planLimits?: {
        canCreateSource?: CanCreateSourceResult;
        canCreateDestination?: CanCreateDestinationResult;
        canStream?: CanStreamResult;
        canCreateChatConnector?: CanCreateChatConnectorResult;
      };
      userPlan?: UserUsage | null;
    }
  }
}

/**
 * Middleware to check if user can create a new stream source
 */
export const canCreateSource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const canCreate = await (subscriptionService as any).canCreateSource(userId);

    if (!canCreate.allowed) {
      res.status(403).json({
        error: 'Source limit exceeded',
        message: `You have reached the maximum number of sources allowed by your plan (${canCreate.current}/${canCreate.max})`,
        current: canCreate.current,
        limit: canCreate.max,
        upgrade_url: '/billing/upgrade',
        code: 'SOURCE_LIMIT_EXCEEDED'
      });
      return;
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
export const canCreateDestination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const canCreate = await (subscriptionService as any).canCreateDestination(userId);

    if (!canCreate.allowed) {
      res.status(403).json({
        error: 'Destination limit exceeded',
        message: `You have reached the maximum number of destinations allowed by your plan (${canCreate.current}/${canCreate.max})`,
        current: canCreate.current,
        limit: canCreate.max,
        upgrade_url: '/billing/upgrade',
        code: 'DESTINATION_LIMIT_EXCEEDED'
      });
      return;
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
export const canStream = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const canStream = await (subscriptionService as any).canStream(userId);

    if (!canStream.allowed) {
      res.status(403).json({
        error: 'Streaming hour limit exceeded',
        message: `You have reached your monthly streaming hour limit (${canStream.current.toFixed(1)}/${canStream.max} hours)`,
        current: canStream.current,
        limit: canStream.max,
        upgrade_url: '/billing/upgrade',
        code: 'STREAMING_HOURS_EXCEEDED'
      });
      return;
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
export const getUserPlanInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const usage = await (subscriptionService as any).getUserUsage(userId);

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
export const hasFeature = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const usage = await (subscriptionService as any).getUserUsage(userId);

      const hasFeature = usage.features && usage.features[feature];

      if (!hasFeature) {
        res.status(403).json({
          error: 'Feature not available',
          message: `The feature "${feature}" is not available in your current plan`,
          upgrade_url: '/billing/upgrade',
          code: 'FEATURE_NOT_AVAILABLE'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Feature check error:', error);
      res.status(500).json({ error: 'Failed to check feature availability' });
    }
  };
};

/**
 * Middleware to check if user can create a new chat connector
 */
export const canCreateChatConnector = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const canCreate = await (subscriptionService as any).canCreateChatConnector(userId);

    if (!canCreate.allowed) {
      res.status(403).json({
        error: 'Chat connector limit exceeded',
        message: `You have reached the maximum number of chat connectors allowed by your plan (${canCreate.current}/${canCreate.max})`,
        current: canCreate.current,
        limit: canCreate.max,
        upgrade_url: '/billing/upgrade',
        code: 'CHAT_CONNECTOR_LIMIT_EXCEEDED'
      });
      return;
    }

    req.planLimits = { canCreateChatConnector: canCreate };
    next();
  } catch (error) {
    console.error('Plan validation error (chat connector creation):', error);
    res.status(500).json({ error: 'Failed to validate plan limits' });
  }
};

export default {
  canCreateSource,
  canCreateDestination,
  canStream,
  getUserPlanInfo,
  hasFeature,
  canCreateChatConnector
};
