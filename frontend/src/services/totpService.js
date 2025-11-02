import api from './api';

/**
 * TOTP Service for Two-Factor Authentication
 * Handles all TOTP-related API calls
 */

/**
 * Get TOTP status for current user
 * @returns {Promise<Object>} TOTP status { enabled, hasSecret }
 */
export const getTOTPStatus = async () => {
  try {
    const response = await api.get('/totp/status');
    return response.data;
  } catch (error) {
    console.error('Failed to get TOTP status:', error);
    throw error;
  }
};

/**
 * Start TOTP setup process
 * Generates secret and QR code for authenticator app
 * @returns {Promise<Object>} Setup data { secret, qrCodeUrl, backupCodes }
 */
export const setupTOTP = async () => {
  try {
    const response = await api.post('/totp/setup');
    return response.data;
  } catch (error) {
    console.error('Failed to setup TOTP:', error);
    throw error;
  }
};

/**
 * Verify TOTP setup and enable 2FA
 * @param {string} code - 6-digit TOTP code from authenticator app
 * @param {string} secret - TOTP secret from setup
 * @returns {Promise<Object>} Verification result { success, backupCodes }
 */
export const verifyTOTP = async (code, secret) => {
  try {
    const response = await api.post('/totp/verify', { code, secret });
    return response.data;
  } catch (error) {
    console.error('Failed to verify TOTP:', error);
    throw error;
  }
};

/**
 * Disable TOTP authentication
 * @param {string} code - Current TOTP code for verification
 * @returns {Promise<Object>} Disable result { success }
 */
export const disableTOTP = async (code) => {
  try {
    const response = await api.post('/totp/disable', { code });
    return response.data;
  } catch (error) {
    console.error('Failed to disable TOTP:', error);
    throw error;
  }
};

/**
 * Generate new backup codes
 * @param {string} code - Current TOTP code for verification
 * @returns {Promise<Object>} New backup codes { backupCodes }
 */
export const generateBackupCodes = async (code) => {
  try {
    const response = await api.post('/totp/backup-codes', { code });
    return response.data;
  } catch (error) {
    console.error('Failed to generate backup codes:', error);
    throw error;
  }
};

/**
 * Start streaming session with TOTP authentication
 * @param {string} code - TOTP code or backup code
 * @param {number} durationHours - Session duration in hours (optional, default 4)
 * @returns {Promise<Object>} Session data { sessionId, expiresAt, streamKeys }
 */
export const startStreamingSession = async (code, durationHours = 4) => {
  try {
    const response = await api.post('/streaming/sessions/start', {
      code,
      durationHours
    });
    return response.data;
  } catch (error) {
    console.error('Failed to start streaming session:', error);
    throw error;
  }
};

/**
 * Stop current streaming session
 * @returns {Promise<Object>} Stop result { success }
 */
export const stopStreamingSession = async () => {
  try {
    const response = await api.post('/streaming/sessions/stop');
    return response.data;
  } catch (error) {
    console.error('Failed to stop streaming session:', error);
    throw error;
  }
};

/**
 * Get current active sessions
 * @returns {Promise<Object>} Active sessions { sessions }
 */
export const getActiveSessions = async () => {
  try {
    const response = await api.get('/streaming/sessions');
    return response.data;
  } catch (error) {
    console.error('Failed to get active sessions:', error);
    throw error;
  }
};

/**
 * Emergency stop all streaming sessions using backup code
 * @param {string} backupCode - One of the user's backup codes
 * @returns {Promise<Object>} Emergency stop result { success, stoppedSessions }
 */
export const emergencyStopStreaming = async (backupCode) => {
  try {
    const response = await api.post('/streaming/emergency/stop', { backupCode });
    return response.data;
  } catch (error) {
    console.error('Failed to emergency stop streaming:', error);
    throw error;
  }
};

export default {
  getTOTPStatus,
  setupTOTP,
  verifyTOTP,
  disableTOTP,
  generateBackupCodes,
  startStreamingSession,
  stopStreamingSession,
  getActiveSessions,
  emergencyStopStreaming
};