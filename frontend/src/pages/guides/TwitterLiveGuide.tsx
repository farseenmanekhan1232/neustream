import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TwitterLiveGuide() {
  return (
    <>
      <Helmet>
        <title>Twitter/X Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Twitter/X Live RTMP streaming. Learn how to use Media Studio to get your RTMP credentials." 
        />
        <meta 
          name="keywords" 
          content="Twitter Live, X Live, RTMP, Media Studio, streaming setup, stream key, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/twitter-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Twitter/X Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Broadcast live to your Twitter/X followers using Media Studio.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Twitter/X Premium subscription or verified account</li>
            <li>• Access to Media Studio</li>
            <li>• Account in good standing with no restrictions</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://studio.twitter.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twitter Media Studio</a></li>
            <li>Click on <strong>Create</strong> → <strong>Go Live</strong></li>
            <li>Set up your stream details (title, description)</li>
            <li>Click <strong>Continue</strong> to access stream settings</li>
            <li>Copy the <strong>RTMP URL</strong></li>
            <li>Copy the <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Tweet about your upcoming stream to build anticipation</li>
            <li>• Use relevant hashtags to reach a wider audience</li>
            <li>• Keep streams concise - Twitter users prefer shorter content</li>
            <li>• Recommended: 720p at 3000-4500 kbps</li>
          </ul>
        </div>
      </div>
    </>
  );
}
