import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function MobcrushGuide() {
  return (
    <>
      <Helmet>
        <title>Mobcrush RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Mobcrush RTMP streaming. Learn about mobile streaming and desktop RTMP options." 
        />
        <meta 
          name="keywords" 
          content="Mobcrush, RTMP, streaming setup, mobile gaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/mobcrush" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Mobcrush - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream mobile games to specialized mobile gaming platform.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">⚠️ Important Note</h3>
          <p className="text-sm">
            Mobcrush primarily focuses on mobile device streaming through their app. RTMP streaming may be limited. Check their latest documentation for desktop streaming options.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">General Setup</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Download Mobcrush app or visit <a href="https://www.mobcrush.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mobcrush website</a></li>
            <li>Create account and log in</li>
            <li>For mobile: Use in-app screen recording features</li>
            <li>For desktop: Check settings for RTMP options</li>
            <li>Copy RTMP URL and Stream Key if available</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Mobcrush specializes in mobile gaming streams</li>
            <li>• Great for PUBG Mobile, Call of Duty Mobile, etc.</li>
            <li>• Built-in screen recording for mobile devices</li>
            <li>• Growing mobile eSports community</li>
          </ul>
        </div>
      </div>
    </>
  );
}
