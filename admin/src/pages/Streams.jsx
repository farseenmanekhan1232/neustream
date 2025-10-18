"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import { Activity, Wifi, WifiOff, RefreshCw, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const Streams = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState(null);
  const [streamDetails, setStreamDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadActiveStreams();

    // Set up real-time updates
    const interval = setInterval(loadActiveStreams, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadActiveStreams = async () => {
    try {
      const response = await adminApi.getActiveStreams();
      setStreams(response.activeStreams || []);
    } catch (error) {
      console.error("Failed to load streams:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStreamDetails = async (streamKey) => {
    if (!streamKey) return;

    setDetailsLoading(true);
    try {
      const details = await adminApi.getStreamInfo(streamKey);
      setStreamDetails(details);
    } catch (error) {
      console.error("Failed to load stream details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const duration = Math.floor((now - start) / 1000);

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const StreamTableRow = ({ stream }) => (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => {
        setSelectedStream(stream);
        loadStreamDetails(stream.stream_key);
      }}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-success/10 rounded-full">
              <Wifi className="h-4 w-4 text-success" />
            </div>
          </div>
          <div>
            <p className="font-medium">
              {stream.email || "Unknown User"}
            </p>
            <p className="text-sm text-muted-foreground">
              {stream.stream_key.substring(0, 8)}...
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="default" className="bg-success/10 text-success">
          Live
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {new Date(stream.started_at).toLocaleString()}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {formatDuration(stream.started_at)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(stream.started_at)} ago</span>
        </div>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
      </TableCell>
    </TableRow>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Active Streams</h1>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stream</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-muted rounded-full"></div>
                        <div>
                          <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-32"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-20 bg-muted rounded"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Streams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor all currently active streaming sessions.
          </p>
        </div>
        <Button variant="outline" onClick={loadActiveStreams}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-success/10 rounded-full">
                <Activity className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {streams.length}
                </p>
                <p className="text-sm text-muted-foreground">Active Streams</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium text-foreground">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streams Table */}
      {streams.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stream</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streams.map((stream) => (
                  <StreamTableRow key={stream.id} stream={stream} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">
              No Active Streams
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no active streaming sessions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stream Details Modal */}
      <Dialog
        open={!!selectedStream}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStream(null);
            setStreamDetails(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Stream Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                User
              </h4>
              <p className="text-sm text-foreground">{selectedStream?.email}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Stream Key
              </h4>
              <p className="text-sm text-foreground font-mono">
                {selectedStream?.stream_key}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Started At
              </h4>
              <p className="text-sm text-foreground">
                {selectedStream &&
                  new Date(selectedStream.started_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Duration
              </h4>
              <p className="text-sm text-foreground">
                {selectedStream && formatDuration(selectedStream.started_at)}
              </p>
            </div>

            {detailsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ) : streamDetails ? (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Forwarding Destinations
                </h4>
                {streamDetails.destinations &&
                streamDetails.destinations.length > 0 ? (
                  <div className="space-y-2">
                    {streamDetails.destinations.map((dest, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground capitalize">
                            {dest.platform}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dest.rtmp_url}
                          </p>
                        </div>
                        <Badge
                          variant="default"
                          className="bg-success/10 text-success"
                        >
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No forwarding destinations configured
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setSelectedStream(null);
                setStreamDetails(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Streams;
