import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function VaughnLiveGuide() {
  return (
    <>
      <Helmet>
        <title>Vaughn Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Vaughn Live RTMP streaming. Learn how to find your RTMP URL and Stream Key in Channel Settings." 
        />
        <meta 
          name="keywords" 
          content="Vaughn Live, RTMP, streaming setup, stream key, variety streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/vaughn-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Vaughn Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to community-driven platform with variety content.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://vaughn.live" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vaughn Live</a> and log in</li>
            <li>Navigate to your <strong>Channel Settings</strong></li>
            <li>Find <strong>Broadcast Settings</strong> or <strong>Stream Key</strong> section</li>
            <li>RTMP URL is typically: <code className="rounded bg-muted px-2 py-0.5">rtmp://live.vaughnsoft.net/live</code></li>
            <li>Copy your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Vaughn Live is community-driven with relaxed content policies</li>
            <li>• Variety content welcome (talk shows, music, gaming)</li>
            <li>• Recommended: 720p at 3000-4500 kbps</li>
            <li>• Smaller community but engaged viewers</li>
          </ul>
        </div>
      </div>
    </>
  );
}
