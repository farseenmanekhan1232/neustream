import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function AfreecaTVGuide() {
  return (
    <>
      <Helmet>
        <title>AfreecaTV RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up AfreecaTV RTMP streaming. Learn how to find your RTMP URL and Stream Key in AfreecaTV Broadcast Settings." 
        />
        <meta 
          name="keywords" 
          content="AfreecaTV, RTMP, streaming setup, stream key, Korean streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/afreecatv" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">AfreecaTV - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to South Korea's premier streaming platform.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Korean phone number may be required for full access</li>
            <li>• Age verification for certain content</li>
            <li>• Korean language interface (some English support)</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://www.afreecatv.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AfreecaTV</a> and log in</li>
            <li>Navigate to <strong>My Page</strong> → <strong>방송국 설정</strong> (Broadcasting Station Settings)</li>
            <li>Click <strong>방송 설정</strong> (Broadcast Settings)</li>
            <li>Find <strong>스트림 주소</strong> (Stream Address)</li>
            <li>Copy your <strong>RTMP URL</strong> and <strong>Stream Key</strong></li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• AfreecaTV has strong eSports heritage (StarCraft, League of Legends)</li>
            <li>• Variety content also popular (eating shows, talk shows)</li>
            <li>• Recommended: 1080p at 5000-6500 kbps</li>
            <li>• Virtual currency (별풍선/Star Balloons) for donations</li>
          </ul>
        </div>
      </div>
    </>
  );
}
