import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function NonoliveGuide() {
  return (
    <>
      <Helmet>
        <title>Nonolive RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Nonolive RTMP streaming. Learn how to find your RTMP URL and Stream Key in broadcaster settings." 
        />
        <meta 
          name="keywords" 
          content="Nonolive, RTMP, streaming setup, stream key, Southeast Asia streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/nonolive" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Nonolive - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Southeast Asian platform with multi-language support.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Download Nonolive app or visit their website</li>
            <li>Log in to your account</li>
            <li>Navigate to broadcaster settings</li>
            <li>Look for desktop/PC streaming options</li>
            <li>Copy your <strong>RTMP URL</strong> and <strong>Stream Key</strong></li>
            <li>Note: May require broadcaster application approval</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Nonolive supports multiple languages (English, Thai, Vietnamese, etc.)</li>
            <li>• Growing platform in Southeast Asia</li>
            <li>• Recommended: 720p at 3000-4500 kbps</li>
            <li>• Social interaction features built-in</li>
          </ul>
        </div>
      </div>
    </>
  );
}
