import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function HuyaGuide() {
  return (
    <>
      <Helmet>
        <title>Huya (虎牙) RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up Huya RTMP streaming. Learn how to find your Stream URL and Stream Key in Huya Broadcasting Tools." 
        />
        <meta 
          name="keywords" 
          content="Huya, 虎牙, RTMP, streaming setup, stream key, eSports streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/huya" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Huya (虎牙) - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Tencent-owned gaming platform focused on eSports.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Chinese phone number for registration</li>
            <li>• May require broadcaster application approval</li>
            <li>• Chinese language interface</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://www.huya.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Huya</a> and log in</li>
            <li>Access <strong>开播工具</strong> (Broadcasting Tools)</li>
            <li>Navigate to <strong>我的直播间</strong> (My Live Room)</li>
            <li>Click <strong>开播设置</strong> (Broadcast Settings)</li>
            <li>Copy your <strong>流地址</strong> (Stream URL)</li>
            <li>Copy your <strong>串流密钥</strong> (Stream Key)</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Huya owned by Tencent provides excellent infrastructure</li>
            <li>• Strong focus on competitive gaming and eSports</li>
            <li>• Recommended: 1080p60 at 6000-8000 kbps</li>
            <li>• Popular for League of Legends, Honor of Kings, and mobile games</li>
          </ul>
        </div>
      </div>
    </>
  );
}
