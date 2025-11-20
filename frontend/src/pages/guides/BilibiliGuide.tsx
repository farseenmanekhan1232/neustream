import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function BilibiliGuide() {
  return (
    <>
      <Helmet>
        <title>Bilibili (哔哩哔哩) RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Bilibili RTMP streaming. Learn how to find your RTMP URL and Stream Key in Bilibili Live Center." 
        />
        <meta 
          name="keywords" 
          content="Bilibili, 哔哩哔哩, RTMP, streaming setup, stream key, ACG streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/bilibili" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Bilibili (哔哩哔哩) - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to China's leading ACG (Anime, Comics, Games) community.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Chinese phone number required for verification</li>
            <li>• Account must meet streaming eligibility requirements</li>
            <li>• Chinese language interface</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://live.bilibili.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Bilibili Live</a> and log in</li>
            <li>Navigate to <strong>直播中心</strong> (Live Center)</li>
            <li>Click <strong>开始直播</strong> (Start Live)</li>
            <li>Go to <strong>直播设置</strong> (Live Settings)</li>
            <li>Copy your <strong>rtmp地址</strong> (RTMP URL)</li>
            <li>Copy your <strong>直播码</strong> (Stream Key)</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Bilibili has massive anime, gaming, and entertainment community</li>
            <li>• Strong monetization through virtual gifts (投币)</li>
            <li>• Recommended: 1080p at 4500-6000 kbps</li>
            <li>• Content must comply with Chinese regulations</li>
          </ul>
        </div>
      </div>
    </>
  );
}
