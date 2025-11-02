import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Stop, Clock, Shield, AlertTriangle, Key, RefreshCw } from "lucide-react";
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

const StreamingSessionManager = ({ onSessionChange }) => {
  const queryClient = useQueryClient();

  // State for session management
  const [startSessionDialogOpen, setStartSessionDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emergencyStopDialogOpen, setEmergencyStopDialogOpen] = useState(false);
  const [emergencyCode, setEmergencyCode] = useState("");
  const [sessionDuration, setSessionDuration] = useState(4); // Default 4 hours

  // Fetch TOTP status to check if 2FA is enabled
  const { data: totpStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["totp-status"],
    queryFn: totpService.getTOTPStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch active sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["streaming-sessions"],
    queryFn: totpService.getActiveSessions,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 30 * 1000,
  });

  // Start streaming session mutation
  const startSessionMutation = useMutation({
    mutationFn: ({ code, durationHours }) => totpService.startStreamingSession(code, durationHours),
    onSuccess: (data) => {
      setStartSessionDialogOpen(false);
      setVerificationCode("");
      queryClient.invalidateQueries(["streaming-sessions"]);
      queryClient.invalidateQueries(["totp-status"]);

      // Calculate expiration time
      const expiresAt = new Date(data.expiresAt);
      const now = new Date();
      const hoursLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60));

      toast.success(`Streaming session active for ${hoursLeft} hours`);

      // Notify parent component
      if (onSessionChange) {
        onSessionChange(data);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Invalid authentication code");
    },
  });

  // Stop streaming session mutation
  const stopSessionMutation = useMutation({
    mutationFn: () => totpService.stopStreamingSession(),
    onSuccess: () => {
      queryClient.invalidateQueries(["streaming-sessions"]);
      toast.success("Your streaming session has been ended");

      // Notify parent component
      if (onSessionChange) {
        onSessionChange(null);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Could not stop session");
    },
  });

  // Emergency stop mutation
  const emergencyStopMutation = useMutation({
    mutationFn: (backupCode) => totpService.emergencyStopStreaming(backupCode),
    onSuccess: (data) => {
      setEmergencyStopDialogOpen(false);
      setEmergencyCode("");
      queryClient.invalidateQueries(["streaming-sessions"]);
      toast.success(`Stopped ${data.stoppedSessions} active sessions`);

      // Notify parent component
      if (onSessionChange) {
        onSessionChange(null);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Invalid backup code");
    },
  });

  const handleStartSession = () => {
    if (!totpStatus?.enabled) {
      toast.error("Please enable two-factor authentication first");
      return;
    }
    setStartSessionDialogOpen(true);
  };

  const handleConfirmStartSession = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit authentication code");
      return;
    }
    startSessionMutation.mutate({ code: verificationCode, durationHours: sessionDuration });
  };

  const handleStopSession = () => {
    stopSessionMutation.mutate();
  };

  const handleEmergencyStop = () => {
    if (!emergencyCode || emergencyCode.length !== 16) {
      toast.error("Please enter a valid backup code");
      return;
    }
    emergencyStopMutation.mutate(emergencyCode);
  };

  // Calculate time remaining for active session
  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffMs = expiration - now;

    if (diffMs <= 0) return "Expired";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`;
    }
    return `${diffMinutes}m remaining`;
  };

  const activeSession = sessionsData?.sessions?.[0];
  const isSessionActive = activeSession && new Date(activeSession.expiresAt) > new Date();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Streaming Session Management</h3>
        <p className="text-sm text-muted-foreground">
          Secure your streaming sessions with two-factor authentication.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Status
          </CardTitle>
          <CardDescription>
            {isSessionActive
              ? "You have an active secure streaming session"
              : "No active streaming session"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isSessionActive ? (
                <div className="flex items-center gap-2 text-success">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="font-medium">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span className="font-medium">Inactive</span>
                </div>
              )}
              <div>
                {isSessionActive ? (
                  <p className="text-sm text-muted-foreground">
                    Expires {getTimeRemaining(activeSession.expiresAt)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Start a session to secure your streaming
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isSessionActive ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleStopSession}
                  disabled={stopSessionMutation.isLoading}
                >
                  <Stop className="h-4 w-4 mr-2" />
                  Stop Session
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStartSession}
                  disabled={startSessionMutation.isLoading || !totpStatus?.enabled}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              )}

              {isSessionActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEmergencyStopDialogOpen(true)}
                  disabled={emergencyStopMutation.isLoading}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Stop
                </Button>
              )}
            </div>
          </div>

          {!totpStatus?.enabled && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is required to start secure streaming sessions.
                Enable it in <a href="/dashboard/settings" className="underline">Settings > Security</a>.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isSessionActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Details
            </CardTitle>
            <CardDescription>Information about your current streaming session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Session ID</Label>
                <Input value={activeSession.id} disabled className="bg-muted font-mono text-sm" />
              </div>
              <div>
                <Label>Started At</Label>
                <Input
                  value={new Date(activeSession.createdAt).toLocaleString()}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Expires At</Label>
                <Input
                  value={new Date(activeSession.expiresAt).toLocaleString()}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  value={`${activeSession.durationHours} hours`}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div>
              <Label>Encrypted Stream Keys</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  {activeSession.streamKeys?.length || 0} stream keys are encrypted and ready for use
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Session Dialog */}
      <Dialog open={startSessionDialogOpen} onOpenChange={setStartSessionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Secure Streaming Session</DialogTitle>
            <DialogDescription>
              Enter your 6-digit authentication code to start a secure streaming session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-duration">Session Duration</Label>
              <select
                id="session-duration"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={4}>4 hours</option>
                <option value={8}>8 hours</option>
                <option value={12}>12 hours</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-code">Authentication Code</Label>
              <Input
                id="auth-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                disabled={startSessionMutation.isLoading}
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
                setStartSessionDialogOpen(false);
                setVerificationCode("");
              }}
              disabled={startSessionMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStartSession}
              disabled={startSessionMutation.isLoading || !verificationCode}
            >
              {startSessionMutation.isLoading ? "Starting..." : "Start Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Stop Dialog */}
      <Dialog open={emergencyStopDialogOpen} onOpenChange={setEmergencyStopDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Emergency Stop</DialogTitle>
            <DialogDescription>
              Use a backup code to immediately stop all streaming sessions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will immediately stop all your active streaming sessions and revoke access.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="emergency-code">Backup Code</Label>
              <Input
                id="emergency-code"
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={emergencyCode}
                onChange={(e) => setEmergencyCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                disabled={emergencyStopMutation.isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Enter one of your backup codes (16 characters with dashes)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEmergencyStopDialogOpen(false);
                setEmergencyCode("");
              }}
              disabled={emergencyStopMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEmergencyStop}
              disabled={emergencyStopMutation.isLoading || !emergencyCode}
            >
              {emergencyStopMutation.isLoading ? "Stopping..." : "Emergency Stop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreamingSessionManager;