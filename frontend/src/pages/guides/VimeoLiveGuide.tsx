import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function VimeoLiveGuide() {
  return (
    <>
      <Helmet>
        <title>Vimeo Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Vimeo Live RTMP streaming. Learn how to find your RTMP URL and Stream Key in Vimeo Live Events." 
        />
        <meta 
          name="keywords" 
          content="Vimeo Live, RTMP, professional streaming, streaming setup, stream key, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/vimeo-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Vimeo Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Professional live streaming with Vimeo's premium platform.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Vimeo Premium, Pro, or Business plan required</li>
            <li>• Live streaming not available on free tier</li>
            <li>• Professional-grade features and analytics</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vimeo</a> and log in</li>
            <li>Navigate to your account → <strong>Live Events</strong></li>
            <li>Click <strong>Create Event</strong> or select existing event</li>
            <li>Go to <strong>Settings</strong> → <strong>Stream</strong></li>
            <li>Copy your <strong>RTMP URL</strong></li>
            <li>Copy your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Vimeo offers exceptional video quality and reliability</li>
            <li>• Advanced analytics and viewer engagement tools</li>
            <li>• Recommended: 1080p at 6000-8000 kbps for professional quality</li>
            <li>• Can embed streams on your website with custom branding</li>
          </ul>
        </div>
      </div>
    </>
  );
}
