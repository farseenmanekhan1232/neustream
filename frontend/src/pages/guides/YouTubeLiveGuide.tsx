import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function YouTubeLiveGuide() {
  return (
    <>
      <Helmet>
        <title>YouTube Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up YouTube Live RTMP streaming. Learn how to find your Stream URL and Stream Key in YouTube Studio." 
        />
        <meta 
          name="keywords" 
          content="YouTube Live, RTMP, streaming setup, stream key, stream URL, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/youtube-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">YouTube Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to YouTube Live using your RTMP credentials from YouTube Studio.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Verified YouTube account</li>
            <li>• No live streaming restrictions (check channel status)</li>
            <li>• Channel must have live streaming enabled (24-hour wait after first enable)</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YouTube Studio</a></li>
            <li>In the top right corner, click <strong>Create</strong> → <strong>Go Live</strong></li>
            <li>Select <strong>Stream</strong> in the left sidebar</li>
            <li>Scroll down to the <strong>Stream settings</strong> section</li>
            <li>Copy your <strong>Stream URL</strong> (typically: <code className="rounded bg-muted px-2 py-0.5">rtmp://a.rtmp.youtube.com/live2</code>)</li>
            <li>Copy your <strong>Stream key</strong> (alphanumeric string)</li>
          </ol>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Using in neustream</h2>
          <p className="leading-7">In neustream dashboard:</p>
          <ol className="list-decimal space-y-2 pl-6 leading-7">
            <li>Click "Add Destination"</li>
            <li>Select "YouTube Live"</li>
            <li>Paste your Stream URL in the RTMP URL field</li>
            <li>Paste your Stream Key</li>
            <li>Click "Save"</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Keep your stream key secret - never share it publicly</li>
            <li>• You can reset your stream key in YouTube Studio if compromised</li>
            <li>• Set stream visibility (Public/Unlisted/Private) in YouTube Studio before going live</li>
            <li>• YouTube recommends 1080p at 4500-9000 kbps for optimal quality</li>
          </ul>
        </div>
      </div>
    </>
  );
}
