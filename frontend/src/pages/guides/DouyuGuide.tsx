import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function DouyuGuide() {
  return (
    <>
      <Helmet>
        <title>Douyu (斗鱼) RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Douyu RTMP streaming. Learn how to find your Push Stream URL and Stream Key in Douyu Broadcaster Center." 
        />
        <meta 
          name="keywords" 
          content="Douyu, 斗鱼, RTMP, streaming setup, stream key, game streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/douyu" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Douyu (斗鱼) - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to one of China's largest game streaming platforms.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Chinese phone number required</li>
            <li>• Real-name verification may be required</li>
            <li>• Chinese language interface</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://www.douyu.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Douyu</a> and log in</li>
            <li>Navigate to <strong>主播中心</strong> (Broadcaster Center)</li>
            <li>Click <strong>直播设置</strong> (Live Settings)</li>
            <li>Copy your <strong>推流地址</strong> (Push Stream URL)</li>
            <li>Copy your <strong>直播码</strong> (Stream Key)</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Douyu focuses primarily on gaming content</li>
            <li>• Large Chinese gaming community</li>
            <li>• Recommended: 1080p at 5000-6500 kbps</li>
            <li>• Strong eSports presence</li>
          </ul>
        </div>
      </div>
    </>
  );
}
