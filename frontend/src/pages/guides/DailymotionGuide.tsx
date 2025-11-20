import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function DailymotionGuide() {
  return (
    <>
      <Helmet>
        <title>Dailymotion RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Dailymotion RTMP streaming. Learn how to find your Stream URL and Stream Name/Key in Dailymotion Partner HQ." 
        />
        <meta 
          name="keywords" 
          content="Dailymotion, RTMP, streaming setup, stream key, partner HQ, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/dailymotion" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Dailymotion - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Dailymotion, the European alternative to YouTube.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://www.dailymotion.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Dailymotion</a> and log in</li>
            <li>Navigate to <strong>Partner HQ</strong> or <strong>Video Manager</strong></li>
            <li>Click <strong>Go Live</strong></li>
            <li>Select <strong>Use an encoder</strong></li>
            <li>Copy your <strong>Stream URL</strong></li>
            <li>Copy your <strong>Stream Name/Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Dailymotion has strong presence in Europe and France</li>
            <li>• Partner program available for monetization</li>
            <li>• Recommended: 1080p at 4500-6000 kbps</li>
            <li>• Good alternative to YouTube with less competition</li>
          </ul>
        </div>
      </div>
    </>
  );
}
