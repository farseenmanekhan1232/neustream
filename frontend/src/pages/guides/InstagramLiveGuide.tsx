import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function InstagramLiveGuide() {
  return (
    <>
      <Helmet>
        <title>Instagram Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete guide to streaming to Instagram Live via RTMP. Learn about third-party tools and alternative methods for Instagram streaming." 
        />
        <meta 
          name="keywords" 
          content="Instagram Live, RTMP, streaming setup, third-party tools, Yellow Duck, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/instagram-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Instagram Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Instagram using third-party RTMP tools.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">⚠️ Important Note</h3>
          <p className="text-sm">
            Instagram doesn't officially support direct RTMP streaming. You can use third-party services that provide RTMP-to-Instagram streaming capabilities.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Alternative Methods</h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-border/50 p-4">
              <h3 className="mb-2 font-semibold">Method 1: Third-Party Services</h3>
              <ol className="list-decimal space-y-2 pl-6 text-sm">
                <li>Subscribe to a service like Yellow Duck or similar RTMP gateway</li>
                <li>Connect your Instagram account</li>
                <li>Receive RTMP credentials from the service</li>
                <li>Use these credentials in neustream</li>
              </ol>
            </div>

            <div className="rounded-lg border border-border/50 p-4">
              <h3 className="mb-2 font-semibold">Method 2: Mobile App Streaming</h3>
              <p className="text-sm text-muted-foreground">
                Use Instagram's native mobile app for direct live streaming without RTMP. This is the most reliable method for Instagram Live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
