import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function OpenrecGuide() {
  return (
    <>
      <Helmet>
        <title>Openrec.tv RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Openrec.tv RTMP streaming. Learn how to find your Stream URL and Stream Key in Openrec Distribution Settings." 
        />
        <meta 
          name="keywords" 
          content="Openrec.tv, RTMP, streaming setup, stream key, Japanese gaming streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/openrec" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Openrec.tv - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Japan's gaming-focused platform.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://www.openrec.tv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Openrec.tv</a> and log in</li>
            <li>Navigate to <strong>配信設定</strong> (Distribution Settings)</li>
            <li>Select <strong>外部ツール配信</strong> (External Tool)</li>
            <li>Copy your <strong>配信URL</strong> (Stream URL)</li>
            <li>Copy your <strong>ストリームキー</strong> (Stream Key)</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Openrec specializes in gaming and eSports</li>
            <li>• Growing Japanese streaming community</li>
            <li>• Recommended: 1080p at 4500-6000 kbps</li>
            <li>• Good monetization for qualified streamers</li>
          </ul>
        </div>
      </div>
    </>
  );
}
