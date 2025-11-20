import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function WowzaGuide() {
  return (
    <>
      <Helmet>
        <title>Wowza Streaming Cloud Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Wowza Streaming Cloud RTMP. Learn how to find your Primary Server RTMP URL and Stream Name." 
        />
        <meta 
          name="keywords" 
          content="Wowza Streaming Cloud, RTMP, professional streaming, streaming setup, stream key, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/wowza" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Wowza Streaming Cloud - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Professional streaming infrastructure with custom configuration.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Log in to <a href="https://cloud.wowza.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Wowza Streaming Cloud</a></li>
            <li>Create a new <strong>Live Stream</strong></li>
            <li>Configure your stream settings (transcoding, protocols, etc.)</li>
            <li>In the stream details, find <strong>Source Settings</strong></li>
            <li>Copy your <strong>Primary Server</strong> RTMP URL</li>
            <li>Copy your <strong>Stream Name</strong> (acts as stream key)</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Wowza provides professional-grade streaming infrastructure</li>
            <li>• Custom RTMP endpoints and advanced transcoding</li>
            <li>• Multi-bitrate streaming for adaptive quality</li>
            <li>• Extensive API for custom integrations</li>
          </ul>
        </div>
      </div>
    </>
  );
}
