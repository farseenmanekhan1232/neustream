import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TikTokLiveGuide() {
  return (
    <>
      <Helmet>
        <title>TikTok Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up TikTok Live RTMP streaming. Learn about requirements and how to get your Stream Key from TikTok Live Studio." 
        />
        <meta 
          name="keywords" 
          content="TikTok Live, RTMP, TikTok Live Studio, streaming setup, stream key, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/tiktok-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">TikTok Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to TikTok using TikTok Live Studio or RTMP.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Must have 1,000+ followers</li>
            <li>• Account must be at least 30 days old</li>
            <li>• Must be 18+ years old</li>
            <li>• Account in good standing</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Download <strong>TikTok Live Studio</strong> from TikTok's official website</li>
            <li>Log in with your TikTok account</li>
            <li>Click on <strong>Settings</strong> or <strong>Stream Key</strong></li>
            <li>Copy your <strong>Server URL</strong></li>
            <li>Copy your <strong>Stream Key</strong></li>
            <li>Note: Stream keys reset after each session</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Vertical format (9:16) recommended for TikTok audience</li>
            <li>• Keep content engaging and fast-paced</li>
            <li>• Use trending sounds and hashtags</li>
            <li>• Recommended: 720p at 2500-4000 kbps</li>
          </ul>
        </div>
      </div>
    </>
  );
}
