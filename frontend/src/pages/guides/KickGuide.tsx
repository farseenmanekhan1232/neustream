import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function KickGuide() {
  return (
    <>
      <Helmet>
        <title>Kick RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Kick RTMP streaming. Learn how to find your RTMP URL and Stream Key in Kick Creator Dashboard." 
        />
        <meta 
          name="keywords" 
          content="Kick, RTMP, streaming setup, stream key, creator dashboard, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/kick" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Kick - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Kick with creator-friendly terms and RTMP support.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://kick.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Kick</a> and log in</li>
            <li>Click on your profile picture → <strong>Creator Dashboard</strong></li>
            <li>Navigate to <strong>Settings</strong> → <strong>Stream</strong></li>
            <li>Copy your <strong>RTMP URL</strong></li>
            <li>Copy or reveal your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Kick offers 95/5 revenue split favoring creators</li>
            <li>• Platform is growing rapidly - good for new streamers</li>
            <li>• Recommended: 1080p60 at 6000-8000 kbps</li>
            <li>• Lower latency compared to some other platforms</li>
          </ul>
        </div>
      </div>
    </>
  );
}
