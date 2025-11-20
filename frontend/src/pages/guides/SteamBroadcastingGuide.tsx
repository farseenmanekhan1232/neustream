import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SteamBroadcastingGuide() {
  return (
    <>
      <Helmet>
        <title>Steam Broadcasting Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Guide to setting up Steam Broadcasting. Learn about Steam's broadcasting features and how to use the Steam client for streaming." 
        />
        <meta 
          name="keywords" 
          content="Steam Broadcasting, Steam, streaming setup, game streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/steam-broadcasting" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Steam Broadcasting - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream directly to the Steam community.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">⚠️ Important Note</h3>
          <p className="text-sm">
            Steam Broadcasting is primarily designed for use with the Steam client and has limited RTMP support. For best results, use Steam's built-in broadcasting feature directly from the Steam client while gaming.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Alternative: Using Steam Client</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Open Steam client and go to <strong>Settings</strong></li>
            <li>Navigate to <strong>Broadcasting</strong></li>
            <li>Set your broadcast privacy (Public, Friends Only, Private)</li>
            <li>Configure quality settings</li>
            <li>Start any game and use <strong>F12</strong> overlay → <strong>Broadcast</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Steam Broadcasting integrates directly with Steam games</li>
            <li>• Viewers can watch through Steam overlay</li>
            <li>• Best for showing gameplay to Steam friends</li>
            <li>• Limited discoverability compared to other platforms</li>
          </ul>
        </div>
      </div>
    </>
  );
}
