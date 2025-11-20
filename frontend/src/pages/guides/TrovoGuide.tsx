import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TrovoGuide() {
  return (
    <>
      <Helmet>
        <title>Trovo RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Trovo RTMP streaming. Learn how to find your Server URL and Stream Key in Trovo Creator Dashboard." 
        />
        <meta 
          name="keywords" 
          content="Trovo, RTMP, streaming setup, stream key, gaming streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/trovo" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Trovo - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Trovo, the growing gaming platform owned by Tencent.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://trovo.live" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Trovo</a> and log in</li>
            <li>Click on your avatar → <strong>Creator Dashboard</strong></li>
            <li>Select <strong>Stream Settings</strong> from the left sidebar</li>
            <li>Copy your <strong>Server URL</strong></li>
            <li>Copy your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Trovo is rapidly growing, especially in gaming community</li>
            <li>• Tencent-owned provides good infrastructure</li>
            <li>• Recommended: 1080p60 at 6000 kbps</li>
            <li>• Competitive monetization options for qualified streamers</li>
          </ul>
        </div>
      </div>
    </>
  );
}
