import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function IBMVideoStreamingGuide() {
  return (
    <>
      <Helmet>
        <title>IBM Video Streaming Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up IBM Video Streaming (Ustream) RTMP. Learn how to find your RTMP URL and Stream Key in the dashboard." 
        />
        <meta 
          name="keywords" 
          content="IBM Video Streaming, Ustream, RTMP, enterprise streaming, streaming setup, stream key, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/ibm-video-streaming" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">IBM Video Streaming - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade streaming solution (formerly Ustream).
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Enterprise Platform</h3>
          <p className="text-sm">
            IBM Video Streaming is an enterprise solution requiring a paid subscription. Contact IBM for pricing and setup assistance.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Log in to your IBM Video Streaming account</li>
            <li>Navigate to <strong>Dashboard</strong> → <strong>Channels</strong></li>
            <li>Select your channel</li>
            <li>Click <strong>Broadcast Settings</strong></li>
            <li>Copy your <strong>RTMP URL</strong></li>
            <li>Copy your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• White-label options for custom branding</li>
            <li>• Advanced analytics and viewer data</li>
            <li>• CDN distribution for global reach</li>
            <li>• Enterprise-level support and SLA guarantees</li>
          </ul>
        </div>
      </div>
    </>
  );
}
