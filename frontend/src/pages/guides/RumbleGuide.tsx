import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function RumbleGuide() {
  return (
    <>
      <Helmet>
        <title>Rumble RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Rumble RTMP streaming. Learn how to find your Server URL and Stream Key in Rumble Studio." 
        />
        <meta 
          name="keywords" 
          content="Rumble, RTMP, streaming setup, stream key, server URL, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/rumble" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Rumble - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Rumble for free-speech focused live content.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://rumble.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Rumble</a> and log in</li>
            <li>Click <strong>Go Live</strong> or navigate to Rumble Studio</li>
            <li>Click on <strong>Stream Settings</strong></li>
            <li>Copy your <strong>Server URL</strong></li>
            <li>Copy your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Rumble monetizes through view-based payments</li>
            <li>• Good platform for political and news content</li>
            <li>• Recommended: 1080p at 4500-6000 kbps</li>
            <li>• Content appears on both Rumble and affiliated partners</li>
          </ul>
        </div>
      </div>
    </>
  );
}
