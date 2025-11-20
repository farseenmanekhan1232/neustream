import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function DLiveGuide() {
  return (
    <>
      <Helmet>
        <title>DLive RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up DLive RTMP streaming. Learn how to find your Stream URL and Key in DLive Stream Settings." 
        />
        <meta 
          name="keywords" 
          content="DLive, RTMP, streaming setup, stream key, blockchain streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/dlive" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">DLive - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to DLive, the blockchain-based platform with crypto rewards.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://dlive.tv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DLive</a> and log in</li>
            <li>Click on your profile → <strong>Dashboard</strong></li>
            <li>Navigate to <strong>Stream Settings</strong></li>
            <li>Your RTMP URL is typically: <code className="rounded bg-muted px-2 py-0.5">rtmp://stream.dlive.tv/live</code></li>
            <li>Copy your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• DLive rewards streamers with cryptocurrency (LINO points)</li>
            <li>• Community-driven platform with low fees</li>
            <li>• Recommended: 1080p at 4500-6000 kbps</li>
            <li>• Supports instant donations via blockchain</li>
          </ul>
        </div>
      </div>
    </>
  );
}
