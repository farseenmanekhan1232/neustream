import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle, XCircle, Copy, Download, Eye, EyeOff } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import totpService from "@/services/totpService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TOTPSettings = () => {
  const queryClient = useQueryClient();

  // State for TOTP setup
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [setupData, setSetupData] = useState(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState("");
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Fetch TOTP status
  const { data: totpStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["totp-status"],
    queryFn: totpService.getTOTPStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Setup TOTP mutation
  const setupTOTPMutation = useMutation({
    mutationFn: () => totpService.setupTOTP(),
    onSuccess: async (data) => {
      setSetupData(data);

      // Generate QR code from the OTPAuth URL
      try {
        const qrDataUrl = await QRCode.toDataURL(data.qrCodeURL, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataURL(qrDataUrl);
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        toast.error('Failed to generate QR code');
        return;
      }

      setSetupDialogOpen(true);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to setup TOTP");
    },
  });

  // Verify TOTP mutation
  const verifyTOTPMutation = useMutation({
    mutationFn: ({ code, secret }) => totpService.verifyTOTP(code, secret),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setSetupDialogOpen(false);
      setBackupCodesDialogOpen(true);
      setVerificationCode("");
      queryClient.invalidateQueries(["totp-status"]);
      toast.success("Two-factor authentication has been enabled");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Invalid verification code");
    },
  });

  // Disable TOTP mutation
  const disableTOTPMutation = useMutation({
    mutationFn: (code) => totpService.disableTOTP(code),
    onSuccess: () => {
      setDisableDialogOpen(false);
      setDisableCode("");
      queryClient.invalidateQueries(["totp-status"]);
      toast.success("Two-factor authentication has been disabled");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Invalid verification code");
    },
  });

  // Generate backup codes mutation
  const generateBackupCodesMutation = useMutation({
    mutationFn: (code) => totpService.generateBackupCodes(code),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setBackupCodesDialogOpen(true);
      toast.success("New backup codes generated");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to generate backup codes");
    },
  });

  const handleSetupTOTP = () => {
    setupTOTPMutation.mutate();
  };

  const handleVerifyTOTP = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }
    verifyTOTPMutation.mutate({ code: verificationCode, secret: setupData.secret });
  };

  const handleDisableTOTP = () => {
    if (!disableCode || disableCode.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }
    disableTOTPMutation.mutate(disableCode);
  };

  const handleGenerateBackupCodes = () => {
    // This will require the user to enter their current TOTP code
    // For now, we'll show a simple prompt
    const code = prompt("Enter your current 6-digit authentication code:");
    if (code && code.length === 6) {
      generateBackupCodesMutation.mutate(code);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const downloadBackupCodes = () => {
    const content = `NeuStream Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nImportant: Keep these codes in a safe place. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neustream-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account with two-factor authentication.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Status
          </CardTitle>
          <CardDescription>
            {totpStatus?.enabled
              ? "Two-factor authentication is currently enabled for your account."
              : "Two-factor authentication is not enabled for your account."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {totpStatus?.enabled ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {totpStatus?.enabled ? "Enabled" : "Disabled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totpStatus?.enabled
                    ? "Your account is protected with 2FA"
                    : "Enable 2FA to secure your account"
                  }
                </p>
              </div>
            </div>

            {totpStatus?.enabled ? (
              <Button
                variant="outline"
                onClick={() => setDisableDialogOpen(true)}
                disabled={disableTOTPMutation.isLoading}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button
                onClick={handleSetupTOTP}
                disabled={setupTOTPMutation.isLoading}
              >
                {setupTOTPMutation.isLoading ? "Setting up..." : "Enable 2FA"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {totpStatus?.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Backup Codes
            </CardTitle>
            <CardDescription>
              Use these codes to access your account if you lose your authenticator device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Emergency Backup Codes</p>
                <p className="text-sm text-muted-foreground">
                  Generate new codes if you've used most of them
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleGenerateBackupCodes}
                disabled={generateBackupCodesMutation.isLoading}
              >
                Generate New Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TOTP Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the verification code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {qrCodeDataURL && (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-white rounded-lg border">
                  <img
                    src={qrCodeDataURL}
                    alt="TOTP QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan this code with Google Authenticator, Authy, or similar app
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                disabled={verifyTOTPMutation.isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSetupDialogOpen(false);
                setVerificationCode("");
                setSetupData(null);
                setQrCodeDataURL("");
              }}
              disabled={verifyTOTPMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyTOTP}
              disabled={verifyTOTPMutation.isLoading || !verificationCode}
            >
              {verifyTOTPMutation.isLoading ? "Verifying..." : "Verify & Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable TOTP Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your current 6-digit authentication code to disable 2FA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling 2FA will make your account less secure. Consider using backup codes instead.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="disable-code">Authentication Code</Label>
              <Input
                id="disable-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                disabled={disableTOTPMutation.isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisableDialogOpen(false);
                setDisableCode("");
              }}
              disabled={disableTOTPMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableTOTP}
              disabled={disableTOTPMutation.isLoading || !disableCode}
            >
              {disableTOTPMutation.isLoading ? "Disabling..." : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={backupCodesDialogOpen} onOpenChange={setBackupCodesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Save these backup codes in a secure location. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Store these codes securely. You'll need them if you lose access to your authenticator app.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between font-mono text-sm">
                  <span className={showBackupCodes ? "" : "blur-sm select-none"}>
                    {showBackupCodes ? code : "XXXX-XXXX-XXXX-XXXX"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBackupCodes(!showBackupCodes)}
              >
                {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showBackupCodes ? "Hide" : "Show"} Codes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(backupCodes.join('\n'), "Backup codes")}
              >
                <Copy className="h-4 w-4" />
                Copy All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadBackupCodes}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setBackupCodesDialogOpen(false)}>
              I've Saved My Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TOTPSettings;