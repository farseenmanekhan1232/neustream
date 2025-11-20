import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function NimoTVGuide() {
  return (
    <>
      <Helmet>
        <title>Nimo TV RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Nimo TV RTMP streaming. Learn how to find your RTMP URL and Stream Key in Nimo TV Stream Management." 
        />
        <meta 
          name="keywords" 
          content="Nimo TV, RTMP, streaming setup, stream key, Southeast Asia streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/nimo-tv" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Nimo TV - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Nimo TV, popular gaming platform in Southeast Asia.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://www.nimo.tv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Nimo TV</a> and log in</li>
            <li>Click on your profile → <strong>Stream Management</strong></li>
            <li>Navigate to <strong>Streaming Settings</strong></li>
            <li>Select your preferred server region (Asia, NA, EU)</li>
            <li>Copy your <strong>RTMP URL</strong></li>
            <li>Copy your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Nimo TV has strong presence in Southeast Asia</li>
            <li>• Multiple language support including English, Thai, Indonesian</li>
            <li>• Recommended: 1080p at 4500-6000 kbps</li>
            <li>• Good monetization for mobile game streamers</li>
          </ul>
        </div>
      </div>
    </>
  );
}
