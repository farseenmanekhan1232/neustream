import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function NicoNicoGuide() {
  return (
    <>
      <Helmet>
        <title>NicoNico Douga (ニコニコ生放送) RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up NicoNico Live RTMP streaming. Learn how to find your RTMP URL and Stream Key in NicoNico Distribution Settings." 
        />
        <meta 
          name="keywords" 
          content="NicoNico Douga, NicoNico Live, ニコニコ生放送, RTMP, streaming setup, stream key, Japanese streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/niconico" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">NicoNico Douga (ニコニコ生放送) - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Japan's iconic video platform with unique comment overlay.
          </p>
        </div>

        <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">📋 Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Premium membership (プレミアム会員) recommended for better features</li>
            <li>• Japanese phone number may be needed</li>
            <li>• Japanese language interface</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://live.nicovideo.jp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NicoNico Live</a> and log in</li>
            <li>Click <strong>番組を作成</strong> (Create Program)</li>
            <li>Navigate to <strong>配信設定</strong> (Distribution Settings)</li>
            <li>Select <strong>外部ツール配信</strong> (External Tool Distribution)</li>
            <li>Copy your <strong>RTMP URL</strong></li>
            <li>Copy your <strong>ストリームキー</strong> (Stream Key)</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• NicoNico famous for scrolling comment overlay system</li>
            <li>• Strong otaku/anime/gaming community</li>
            <li>• Recommended: 720p at 3000-4500 kbps</li>
            <li>• Time-limited free broadcasting (premium extends time)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
