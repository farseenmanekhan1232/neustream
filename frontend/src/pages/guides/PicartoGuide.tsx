import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PicartoGuide() {
  return (
    <>
      <Helmet>
        <title>Picarto RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Picarto RTMP streaming. Learn how to find your RTMP URL and Stream Key in Picarto Dashboard." 
        />
        <meta 
          name="keywords" 
          content="Picarto, RTMP, streaming setup, stream key, art streaming, creative streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/picarto" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Picarto - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream your creative process to artist-focused community.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://picarto.tv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Picarto</a> and log in</li>
            <li>Click on your username → <strong>Dashboard</strong></li>
            <li>Navigate to <strong>Stream Settings</strong></li>
            <li>RTMP URL: <code className="rounded bg-muted px-2 py-0.5">rtmp://live.picarto.tv/golive</code></li>
            <li>Copy your <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Picarto perfect for artists, illustrators, and creatives</li>
            <li>• Stream your drawing, painting, 3D modeling process</li>
            <li>• Recommended: 1080p at 4500-6000 kbps for art detail</li>
            <li>• Supportive creative community</li>
          </ul>
        </div>
      </div>
    </>
  );
}
