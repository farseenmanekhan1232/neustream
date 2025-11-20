import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function CaffeineGuide() {
  return (
    <>
      <Helmet>
        <title>Caffeine RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Caffeine RTMP streaming. Learn how to find your RTMP URL and Stream Key in Caffeine Broadcast Settings." 
        />
        <meta 
          name="keywords" 
          content="Caffeine, RTMP, streaming setup, stream key, low latency streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/caffeine" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Caffeine - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Caffeine with ultra-low latency for real-time interaction.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://www.caffeine.tv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Caffeine</a> and log in</li>
            <li>Navigate to <strong>Broadcast Settings</strong></li>
            <li>Click <strong>Get Stream Key</strong></li>
            <li>Copy your <strong>RTMP URL</strong></li>
            <li>Copy your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Caffeine specializes in low-latency streaming (under 1 second)</li>
            <li>• Great for gaming and entertainment content</li>
            <li>• Recommended: 1080p at 5000-6500 kbps</li>
            <li>• Built-in monetization through digital items</li>
          </ul>
        </div>
      </div>
    </>
  );
}
