import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function App() {
  const [user, setUser] = useState(null)
  const [streamInfo, setStreamInfo] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [newDestination, setNewDestination] = useState({
    platform: 'youtube',
    rtmpUrl: '',
    streamKey: ''
  })

  // Mock user for demo (in real app, implement proper auth)
  useEffect(() => {
    const mockUser = { id: 1, email: 'demo@neustream.com', streamKey: 'demo_stream_key_123' }
    setUser(mockUser)
    fetchStreamInfo(mockUser.id)
    fetchDestinations(mockUser.id)
  }, [])

  const fetchStreamInfo = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/streams/info?userId=${userId}`)
      setStreamInfo(response.data)
    } catch (error) {
      console.error('Failed to fetch stream info:', error)
    }
  }

  const fetchDestinations = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/destinations?userId=${userId}`)
      setDestinations(response.data.destinations || [])
    } catch (error) {
      console.error('Failed to fetch destinations:', error)
    }
  }

  const addDestination = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/destinations`, {
        ...newDestination,
        userId: user.id
      })
      setNewDestination({ platform: 'youtube', rtmpUrl: '', streamKey: '' })
      fetchDestinations(user.id)
    } catch (error) {
      console.error('Failed to add destination:', error)
    }
  }

  const deleteDestination = async (id) => {
    try {
      await axios.delete(`${API_BASE}/destinations/${id}`)
      fetchDestinations(user.id)
    } catch (error) {
      console.error('Failed to delete destination:', error)
    }
  }

  if (!user) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Neustream</h1>
        <p>Multi-platform streaming made simple</p>
      </div>

      {/* Stream Information */}
      <div className="card">
        <h2>Your Stream</h2>
        {streamInfo && (
          <div className="stream-info">
            <h3>Stream Configuration</h3>
            <div className="stream-key">
              <strong>Stream Key:</strong> {streamInfo.streamKey}
            </div>
            <p><strong>RTMP URL:</strong> {streamInfo.rtmpUrl}</p>
            <div style={{ marginTop: '12px' }}>
              <span className={`status-badge ${streamInfo.isActive ? 'status-active' : 'status-inactive'}`}>
                {streamInfo.isActive ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Destinations */}
      <div className="card">
        <h2>Streaming Destinations</h2>

        {/* Add Destination Form */}
        <form onSubmit={addDestination} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr auto', gap: '12px', alignItems: 'end' }}>
            <div className="form-group">
              <label>Platform</label>
              <select
                value={newDestination.platform}
                onChange={(e) => setNewDestination({...newDestination, platform: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  background: '#0f0f23',
                  color: '#ffffff'
                }}
              >
                <option value="youtube">YouTube</option>
                <option value="twitch">Twitch</option>
                <option value="facebook">Facebook</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="form-group">
              <label>RTMP URL</label>
              <input
                type="text"
                value={newDestination.rtmpUrl}
                onChange={(e) => setNewDestination({...newDestination, rtmpUrl: e.target.value})}
                placeholder="rtmp://..."
                required
              />
            </div>
            <div className="form-group">
              <label>Stream Key</label>
              <input
                type="text"
                value={newDestination.streamKey}
                onChange={(e) => setNewDestination({...newDestination, streamKey: e.target.value})}
                placeholder="Your stream key"
                required
              />
            </div>
            <button type="submit" className="btn">Add</button>
          </div>
        </form>

        {/* Destination List */}
        <div className="destination-list">
          {destinations.map(destination => (
            <div key={destination.id} className="destination-item">
              <div className="destination-info">
                <h4>{destination.platform.toUpperCase()}</h4>
                <p>{destination.rtmp_url}</p>
              </div>
              <button
                onClick={() => deleteDestination(destination.id)}
                className="btn btn-secondary"
              >
                Remove
              </button>
            </div>
          ))}
          {destinations.length === 0 && (
            <p style={{ color: '#cccccc', textAlign: 'center', padding: '20px' }}>
              No destinations added yet. Add your first streaming platform above.
            </p>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="card">
        <h2>Setup Instructions</h2>
        <ol style={{ color: '#cccccc', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Copy your Stream Key and RTMP URL above</li>
          <li>Add your streaming destinations (YouTube, Twitch, Facebook, etc.)</li>
          <li>Configure OBS Studio with the RTMP URL and Stream Key</li>
          <li>Start streaming in OBS - your stream will be sent to all enabled destinations</li>
        </ol>
      </div>
    </div>
  )
}

export default App