"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  Mail,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Reply,
  Tag,
  ExternalLink,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function Contact() {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getContactSubmissions({
        page: 1,
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
      setSubmissions(response.submissions || []);
      setFilteredSubmissions(response.submissions || []);
    } catch (error) {
      console.error("Failed to load contact submissions:", error);
      showNotification("Failed to load contact submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterSubmissions(value, statusFilter, priorityFilter);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    filterSubmissions(searchTerm, value, priorityFilter);
  };

  const handlePriorityFilter = (value) => {
    setPriorityFilter(value);
    filterSubmissions(searchTerm, statusFilter, value);
  };

  const filterSubmissions = (search, status, priority) => {
    let filtered = submissions;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (submission) =>
          submission.name.toLowerCase().includes(search.toLowerCase()) ||
          submission.email.toLowerCase().includes(search.toLowerCase()) ||
          submission.subject.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((submission) => submission.status === status);
    }

    // Apply priority filter
    if (priority !== "all") {
      filtered = filtered.filter((submission) => submission.priority === priority);
    }

    setFilteredSubmissions(filtered);
  };

  const handleViewSubmission = async (submission) => {
    try {
      const response = await adminApi.getContactSubmission(submission.id);
      setSelectedSubmission(response.submission);
      setShowSubmissionDetails(true);
    } catch (error) {
      console.error("Failed to load submission details:", error);
      showNotification("Failed to load submission details", "error");
    }
  };

  const handleRespondToSubmission = (submission) => {
    setSelectedSubmission(submission);
    setResponseText("");
    setShowResponseDialog(true);
  };

  const handleSendResponse = async () => {
    if (!selectedSubmission || !responseText.trim()) return;

    setActionLoading(true);
    try {
      await adminApi.addContactResponse(selectedSubmission.id, {
        response: responseText.trim(),
        responseType: 'email'
      });

      showNotification("Response sent successfully");
      setShowResponseDialog(false);
      setSelectedSubmission(null);
      setResponseText("");
      loadSubmissions();
    } catch (error) {
      console.error("Failed to send response:", error);
      showNotification("Failed to send response", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (submissionId, status) => {
    setActionLoading(true);
    try {
      await adminApi.updateContactSubmission(submissionId, { status });
      showNotification("Status updated successfully");
      loadSubmissions();
    } catch (error) {
      console.error("Failed to update status:", error);
      showNotification("Failed to update status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "secondary",
      responded: "default",
      resolved: "success",
      spam: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: "secondary",
      normal: "outline",
      high: "secondary",
      urgent: "destructive",
    };
    return (
      <Badge variant={variants[priority] || "outline"} className="capitalize">
        {priority}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {notification.message && (
        <Alert className={cn(
          "mb-4",
          notification.type === "error" ? "border-red-200 bg-red-50 text-red-800" :
          "border-green-200 bg-green-50 text-green-800"
        )}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-normal text-gray-900">Contact Submissions</h1>
          <p className="text-gray-600 mt-1">Manage and respond to customer inquiries</p>
        </div>
        <Button onClick={loadSubmissions} variant="outline" disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {submissions.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-green-600">
                  {submissions.filter(s => s.status === 'responded').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">
                  {submissions.filter(s => s.priority === 'urgent').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger id="status-filter" className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={handlePriorityFilter}>
                <SelectTrigger id="priority-filter" className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No contact submissions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.name}</div>
                        <div className="text-sm text-gray-500">{submission.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{submission.subject}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>{getPriorityBadge(submission.priority)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {formatDate(submission.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {submission.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRespondToSubmission(submission)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                        )}
                        {submission.status === 'responded' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(submission.id, 'resolved')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Submission Details Modal */}
      <Dialog open={showSubmissionDetails} onOpenChange={setShowSubmissionDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedSubmission.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div>
                  <Label>Subject</Label>
                  <p className="font-medium">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  {getPriorityBadge(selectedSubmission.priority)}
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <div className="bg-gray-50 p-3 rounded-md mt-1">
                  <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <Label>Submitted</Label>
                  <p>{formatDate(selectedSubmission.createdAt)}</p>
                </div>
                {selectedSubmission.respondedAt && (
                  <div>
                    <Label>Responded</Label>
                    <p>{formatDate(selectedSubmission.respondedAt)}</p>
                  </div>
                )}
              </div>
              {selectedSubmission.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-gray-600">{selectedSubmission.notes}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSubmissionDetails(false)}>
                  Close
                </Button>
                {selectedSubmission.status === 'pending' && (
                  <Button onClick={() => {
                    setShowSubmissionDetails(false);
                    handleRespondToSubmission(selectedSubmission);
                  }}>
                    <Reply className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Response</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600 mb-2">Original message from {selectedSubmission.name}:</p>
                <p className="text-sm">{selectedSubmission.subject}</p>
                <p className="text-sm mt-1 italic">"{selectedSubmission.message.substring(0, 100)}..."</p>
              </div>
              <div>
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response here..."
                  rows={5}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendResponse}
                  disabled={!responseText.trim() || actionLoading}
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send Response
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}