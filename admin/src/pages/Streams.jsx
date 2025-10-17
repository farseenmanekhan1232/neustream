import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  Activity,
  Wifi,
  WifiOff,
  ExternalLink,
  RefreshCw,
  Eye,
  Clock
} from 'lucide-react';

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
      console.error('Failed to load streams:', error);
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
      console.error('Failed to load stream details:', error);
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

  const StreamCard = ({ stream }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => {
           setSelectedStream(stream);
           loadStreamDetails(stream.stream_key);
         }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-green-100 rounded-full">
              <Wifi className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {stream.email || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500">
              Stream Key: {stream.stream_key.substring(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Live
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Started</p>
          <p className="text-sm text-gray-900">
            {new Date(stream.started_at).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Duration</p>
          <p className="text-sm text-gray-900">
            {formatDuration(stream.started_at)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Updated {formatDuration(stream.started_at)} ago</span>
        </div>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Active Streams</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Streams</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor all currently active streaming sessions.
          </p>
        </div>
        <button
          onClick={loadActiveStreams}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{streams.length}</p>
              <p className="text-sm text-gray-500">Active Streams</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Streams Grid */}
      {streams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-12 text-center">
            <WifiOff className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Active Streams</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no active streaming sessions.
            </p>
          </div>
        </div>
      )}

      {/* Stream Details Modal */}
      {selectedStream && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Stream Details</h3>
              <button
                onClick={() => {
                  setSelectedStream(null);
                  setStreamDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">User</h4>
                <p className="text-sm text-gray-900">{selectedStream.email}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Stream Key</h4>
                <p className="text-sm text-gray-900 font-mono">{selectedStream.stream_key}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Started At</h4>
                <p className="text-sm text-gray-900">
                  {new Date(selectedStream.started_at).toLocaleString()}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                <p className="text-sm text-gray-900">
                  {formatDuration(selectedStream.started_at)}
                </p>
              </div>

              {detailsLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : streamDetails ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Forwarding Destinations</h4>
                  {streamDetails.destinations && streamDetails.destinations.length > 0 ? (
                    <div className="space-y-2">
                      {streamDetails.destinations.map((dest, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{dest.platform}</p>
                            <p className="text-xs text-gray-500">{dest.rtmp_url}</p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No forwarding destinations configured</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Streams;