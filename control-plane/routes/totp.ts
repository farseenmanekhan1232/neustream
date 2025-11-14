import express, { Request, Response } from "express";
import Database from "../lib/database";
import { authenticateToken } from "../middleware/auth";
import TOTPService from "../services/totpService";

const router = express.Router();
const db = new Database();
const totpService = new TOTPService();

/**
 * Get TOTP status for current user
 */
router.get("/status", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;

  try {
    const isEnabled = await totpService.isTOTPEnabled(userId);

    res.json({
      totpEnabled: isEnabled
    });
  } catch (error: any) {
    console.error("Error getting TOTP status:", error);
    res.status(500).json({
      error: "Failed to get TOTP status",
      message: error.message
    });
  }
});

/**
 * Start TOTP setup - generate secret and QR code
 */
router.post("/setup", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;

  try {
    // Check if TOTP is already enabled
    const isEnabled = await totpService.isTOTPEnabled(userId);
    if (isEnabled) {
      res.status(400).json({
        error: "TOTP already enabled",
        message: "TOTP is already enabled for your account"
      });
      return;
    }

    // Generate new TOTP secret
    const secret = totpService.generateSecret();
    const qrCodeURL = totpService.generateQRCodeURL(secret, (req as any).user.email);

    // Store the secret temporarily (in production, this should be encrypted)
    // For now, we'll return it to the client for verification

    res.json({
      success: true,
      secret: secret, // In production, don't return the secret directly
      qrCodeURL,
      message: "Scan the QR code with your authenticator app"
    });

  } catch (error: any) {
    console.error("Error starting TOTP setup:", error);
    res.status(500).json({
      error: "Failed to start TOTP setup",
      message: error.message
    });
  }
});

/**
 * Verify TOTP setup and enable it
 */
router.post("/verify", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { secret, code } = req.body as { secret: string; code: string };
  const userId = (req as any).user.id;

  try {
    // Verify the TOTP code
    const isValid = totpService.verifyCode(secret, code);
    if (!isValid) {
      res.status(400).json({
        error: "Invalid TOTP code",
        message: "The TOTP code you entered is invalid"
      });
      return;
    }

    // Enable TOTP for the user
    await totpService.enableTOTP(userId, secret);

    // Generate backup codes
    const backupCodes = totpService.generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(code => ({
      code: totpService.hashBackupCode(code.code),
      used: false
    }));

    // Store backup codes
    await db.query(
      'UPDATE users SET backup_codes = $1 WHERE id = $2',
      [JSON.stringify(hashedBackupCodes), userId]
    );

    res.json({
      success: true,
      backupCodes: backupCodes.map(bc => bc.code), // Return plain backup codes for user to save
      message: "TOTP enabled successfully. Save your backup codes in a secure location."
    });

  } catch (error: any) {
    console.error("Error verifying TOTP:", error);
    res.status(500).json({
      error: "Failed to enable TOTP",
      message: error.message
    });
  }
});

/**
 * Disable TOTP
 */
router.post("/disable", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { currentCode } = req.body as { currentCode: string };
  const userId = (req as any).user.id;

  try {
    // Verify current TOTP code
    const isValid = await totpService.verifyUserTOTP(userId, currentCode);
    if (!isValid) {
      res.status(400).json({
        error: "Invalid TOTP code",
        message: "The TOTP code you entered is invalid"
      });
      return;
    }

    // Disable TOTP
    await totpService.disableTOTP(userId);

    res.json({
      success: true,
      message: "TOTP disabled successfully"
    });

  } catch (error: any) {
    console.error("Error disabling TOTP:", error);
    res.status(500).json({
      error: "Failed to disable TOTP",
      message: error.message
    });
  }
});

/**
 * Generate new backup codes
 */
router.post("/backup-codes", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { currentCode } = req.body as { currentCode: string };
  const userId = (req as any).user.id;

  try {
    // Verify current TOTP code
    const isValid = await totpService.verifyUserTOTP(userId, currentCode);
    if (!isValid) {
      res.status(400).json({
        error: "Invalid TOTP code",
        message: "The TOTP code you entered is invalid"
      });
      return;
    }

    // Generate new backup codes
    const backupCodes = totpService.generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(code => ({
      code: totpService.hashBackupCode(code.code),
      used: false
    }));

    // Store new backup codes (this invalidates old ones)
    await db.query(
      'UPDATE users SET backup_codes = $1 WHERE id = $2',
      [JSON.stringify(hashedBackupCodes), userId]
    );

    res.json({
      success: true,
      backupCodes: backupCodes.map(bc => bc.code),
      message: "New backup codes generated. Save these in a secure location."
    });

  } catch (error: any) {
    console.error("Error generating backup codes:", error);
    res.status(500).json({
      error: "Failed to generate backup codes",
      message: error.message
    });
  }
});

export default router;
