import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function BigoLiveGuide() {
  return (
    <>
      <Helmet>
        <title>Bigo Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Bigo Live RTMP streaming. Learn about mobile app streaming and desktop RTMP options." 
        />
        <meta 
          name="keywords" 
          content="Bigo Live, RTMP, streaming setup, mobile streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/bigo-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Bigo Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Southeast Asia's popular mobile-first platform.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">⚠️ Important Note</h3>
          <p className="text-sm">
            Bigo Live is primarily designed for mobile streaming through their app. Desktop/RTMP streaming may have limited availability or require broadcaster status.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Alternative: Mobile App Streaming</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Download Bigo Live app from App Store or Google Play</li>
            <li>Create account and complete verification</li>
            <li>Apply for broadcaster status if required</li>
            <li>Use in-app streaming features for mobile broadcasts</li>
            <li>For desktop streaming, contact Bigo Live support for RTMP access</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Bigo Live extremely popular in Southeast Asia</li>
            <li>• Mobile-first platform with strong social features</li>
            <li>• Virtual gifts for monetization</li>
            <li>• Multi-language support across Asia</li>
          </ul>
        </div>
      </div>
    </>
  );
}
