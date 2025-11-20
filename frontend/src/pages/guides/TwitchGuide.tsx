import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TwitchGuide() {
  return (
    <>
      <Helmet>
        <title>Twitch RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Twitch RTMP streaming. Learn how to find your Stream Key in Twitch Creator Dashboard and select the best ingest server." 
        />
        <meta 
          name="keywords" 
          content="Twitch, RTMP, streaming setup, stream key, ingest server, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/twitch" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Twitch - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Configure your Twitch stream with RTMP credentials from your Creator Dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://dashboard.twitch.tv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twitch Creator Dashboard</a></li>
            <li>Click on <strong>Settings</strong> in the left sidebar</li>
            <li>Select <strong>Stream</strong></li>
            <li>Under "Primary Stream key", click <strong>Copy</strong> to copy your stream key</li>
            <li>For Server URL, select your closest ingest server from the dropdown, or use: <code className="rounded bg-muted px-2 py-0.5">rtmp://live.twitch.tv/app/</code></li>
          </ol>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recommended Ingest Servers</h2>
          <div className="not-prose rounded-lg border border-border/50 bg-muted/50 p-4">
            <div className="space-y-2 text-sm">
              <div><strong>Auto (Recommended):</strong> <code>rtmp://live.twitch.tv/app/</code></div>
              <div><strong>US West:</strong> <code>rtmp://live-sjc.twitch.tv/app/</code></div>
              <div><strong>US East:</strong> <code>rtmp://live-iad.twitch.tv/app/</code></div>
              <div><strong>Europe:</strong> <code>rtmp://live-fra.twitch.tv/app/</code></div>
              <div><strong>Asia:</strong> <code>rtmp://live-sin.twitch.tv/app/</code></div>
            </div>
          </div>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Use the auto server for best performance (Twitch selects closest)</li>
            <li>• Reset stream key if accidentally exposed</li>
            <li>• Twitch recommends 720p60 at 4500-6000 kbps or 1080p60 at 6000 kbps for partners</li>
            <li>• Enable two-factor authentication for account security</li>
          </ul>
        </div>
      </div>
    </>
  );
}
