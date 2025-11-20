import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function VKLiveGuide() {
  return (
    <>
      <Helmet>
        <title>VK Live RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up VK Live RTMP streaming. Learn how to find your RTMP Address and Stream Key in VK Video settings." 
        />
        <meta 
          name="keywords" 
          content="VK Live, VKontakte, RTMP, streaming setup, stream key, Russian streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/vk-live" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">VK Live - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Russia's largest social network, VKontakte.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">VK. com</a> and log in</li>
            <li>Navigate to <strong>VK Video</strong> section</li>
            <li>Click <strong>Прямой эфир</strong> (Live Broadcast)</li>
            <li>Select <strong>Настройки трансляции</strong> (Broadcast Settings)</li>
            <li>Copy your <strong>RTMP адрес</strong> (RTMP Address)</li>
            <li>Copy your <strong>Ключ трансляции</strong> (Stream Key)</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• VK Live integrates with Russia's largest social network</li>
            <li>• Automatic sharing to your VK profile and groups</li>
            <li>• Recommended: 1080p at 4500-6000 kbps</li>
            <li>• Russian language interface with social features</li>
          </ul>
        </div>
      </div>
    </>
  );
}
