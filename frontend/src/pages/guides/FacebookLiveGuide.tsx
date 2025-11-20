import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function FacebookLiveGuide() {
  return (
    <>
      <Helmet>
        <title>Facebook Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Facebook Live RTMP streaming. Learn how to use Facebook Live Producer to get your persistent stream key." 
        />
        <meta 
          name="keywords" 
          content="Facebook Live, RTMP, RTMPS, streaming setup, stream key, live producer, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/facebook-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Facebook Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to your Facebook page or profile using persistent stream keys.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://www.facebook.com/live/producer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Facebook Live Producer</a></li>
            <li>Select where you want to stream (Profile, Page, or Group)</li>
            <li>Click on <strong>Use Stream Key</strong></li>
            <li>Under "Persistent Stream Key", click <strong>Create New Key</strong> (or use existing)</li>
            <li>Copy the <strong>Server URL</strong> (starts with <code className="rounded bg-muted px-2 py-0.5">rtmps://</code>)</li>
            <li>Copy the <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">⚠️ Important Notes</h3>
          <ul className="space-y-1 text-sm">
            <li>• Facebook uses RTMPS (secure RTMP) - ensure your encoder supports it</li>
            <li>• Persistent stream keys remain valid until you delete them</li>
            <li>• You can have multiple persistent keys for different purposes</li>
            <li>• Maximum resolution: 1080p at 30fps or 720p at 60fps</li>
          </ul>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Set your stream title and description before going live</li>
            <li>• Use 720p at 4000 kbps for best quality/compatibility balance</li>
            <li>• Schedule your stream in advance to notify followers</li>
            <li>• Check your page's content restrictions before streaming</li>
          </ul>
        </div>
      </div>
    </>
  );
}
