import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Header from '../components/Header'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function Dashboard({ user, onLogout }) {
  const queryClient = useQueryClient()
  const [newDestination, setNewDestination] = useState({
    platform: 'youtube',
    rtmpUrl: '',
    streamKey: ''
  })

  // Fetch stream info
  const { data: streamInfo, isLoading: streamLoading } = useQuery({
    queryKey: ['streamInfo', user.id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/streams/info?userId=${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch stream info')
      return response.json()
    },
  })

  // Fetch destinations
  const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
    queryKey: ['destinations', user.id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/destinations?userId=${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch destinations')
      return response.json()
    },
  })

  const destinations = destinationsData?.destinations || []

  // Add destination mutation
  const addDestinationMutation = useMutation({
    mutationFn: async (destination) => {
      const response = await fetch(`${API_BASE}/destinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...destination,
          userId: user.id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add destination')
      }

      return response.json()
    },
    onSuccess: () => {
      setNewDestination({ platform: 'youtube', rtmpUrl: '', streamKey: '' })
      queryClient.invalidateQueries(['destinations', user.id])
    },
  })

  // Delete destination mutation
  const deleteDestinationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE}/destinations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete destination')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['destinations', user.id])
    },
  })

  const handleAddDestination = (e) => {
    e.preventDefault()
    addDestinationMutation.mutate(newDestination)
  }

  const handleDeleteDestination = (id) => {
    deleteDestinationMutation.mutate(id)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="section-padding">
        <div className="container-custom space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Your <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Manage your multi-platform streaming setup
            </p>
            <button
              onClick={onLogout}
              className="btn btn-outline"
            >
              Logout
            </button>
          </div>

          {/* Stream Information */}
          <div className="card">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Your Stream</h2>
              {streamLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : streamInfo ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Stream Configuration</h3>
                      <div className="p-3 bg-muted rounded-md font-mono text-sm">
                        <strong>Stream Key:</strong> {streamInfo.streamKey}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>RTMP URL:</strong> {streamInfo.rtmpUrl}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`status-badge ${streamInfo.isActive ? 'status-active' : 'status-inactive'}`}>
                        {streamInfo.isActive ? 'Live' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No stream information available</p>
              )}
            </div>
          </div>

          {/* Destinations */}
          <div className="card">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Streaming Destinations</h2>

              {/* Add Destination Form */}
              <form onSubmit={handleAddDestination} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="form-group">
                    <label htmlFor="platform" className="form-label">Platform</label>
                    <select
                      id="platform"
                      value={newDestination.platform}
                      onChange={(e) => setNewDestination({...newDestination, platform: e.target.value})}
                      className="form-input"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="twitch">Twitch</option>
                      <option value="facebook">Facebook</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="rtmpUrl" className="form-label">RTMP URL</label>
                    <input
                      id="rtmpUrl"
                      type="text"
                      value={newDestination.rtmpUrl}
                      onChange={(e) => setNewDestination({...newDestination, rtmpUrl: e.target.value})}
                      placeholder="rtmp://..."
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="streamKey" className="form-label">Stream Key</label>
                    <input
                      id="streamKey"
                      type="text"
                      value={newDestination.streamKey}
                      onChange={(e) => setNewDestination({...newDestination, streamKey: e.target.value})}
                      placeholder="Your stream key"
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={addDestinationMutation.isPending}
                      className="btn btn-primary w-full"
                    >
                      {addDestinationMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Destination List */}
              <div className="space-y-4">
                {destinationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : destinations.length > 0 ? (
                  destinations.map(destination => (
                    <div key={destination.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{destination.platform.toUpperCase()}</h4>
                        <p className="text-sm text-muted-foreground">{destination.rtmp_url}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDestination(destination.id)}
                        disabled={deleteDestinationMutation.isPending}
                        className="btn btn-outline text-sm"
                      >
                        {deleteDestinationMutation.isPending ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No destinations added yet. Add your first streaming platform above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="card">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Setup Instructions</h2>
              <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Copy your Stream Key and RTMP URL above</li>
                <li>Add your streaming destinations (YouTube, Twitch, Facebook, etc.)</li>
                <li>Configure OBS Studio with the RTMP URL and Stream Key</li>
                <li>Start streaming in OBS - your stream will be sent to all enabled destinations</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard