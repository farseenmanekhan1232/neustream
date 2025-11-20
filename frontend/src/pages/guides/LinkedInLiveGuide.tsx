import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function LinkedInLiveGuide() {
  return (
    <>
      <Helmet>
        <title>LinkedIn Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up LinkedIn Live RTMP streaming. Learn about requirements and how to get your RTMP credentials." 
        />
        <meta 
          name="keywords" 
          content="LinkedIn Live, RTMP, professional streaming, streaming setup, stream key, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/linkedin-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">LinkedIn Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream professionally to LinkedIn using third-party broadcast access.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• LinkedIn account in good standing</li>
            <li>• Must apply for LinkedIn Live access through their application process</li>
            <li>• Use approved third-party broadcasting tool (like neustream)</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a></li>
            <li>Click <strong>Start a post</strong> → <strong>Create an event</strong></li>
            <li>Choose <strong>LinkedIn Live</strong> as the event type</li>
            <li>You'll receive RTMP credentials from your approved broadcasting partner</li>
            <li>Alternatively, use LinkedIn's API with approved tools like neustream</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• LinkedIn Live is best for professional content and business networking</li>
            <li>• Schedule your stream in advance to maximize attendance</li>
            <li>• Engage with viewers through comments during the stream</li>
            <li>• Use 720p at 3000-4000 kbps for professional quality</li>
          </ul>
        </div>
      </div>
    </>
  );
}
