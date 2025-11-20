import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function OKruGuide() {
  return (
    <>
      <Helmet>
        <title>OK.ru (Odnoklassniki) RTMP Setup Guide | neustream</title>
        <meta 
          name="description" 
          content="Complete step-by-step guide to setting up OK.ru RTMP streaming. Learn how to find your RTMP URL and Stream Key in OK.ru Video settings." 
        />
        <meta 
          name="keywords" 
          content="OK.ru, Odnoklassniki, RTMP, streaming setup, stream key, Russian streaming, neustream, multistreaming" 
        />
        <link rel="canonical" href="https://neustream.app/help/platforms/ok-ru" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">OK.ru (Odnoklassniki) - RTMP Setup</h1>
          <p className="text-lg text-muted-foreground">
            Stream to Odnoklassniki, popular in Russia and CIS countries.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Getting Your RTMP URL & Stream Key</h2>
          <ol className="list-decimal space-y-3 pl-6 leading-7">
            <li>Go to <a href="https://ok.ru" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OK.ru</a> and log in</li>
            <li>Navigate to <strong>Видео</strong> (Video) section</li>
            <li>Click <strong>Прямая трансляция</strong> (Live Broadcast)</li>
            <li>Select <strong>Настройки</strong> (Settings)</li>
            <li>Copy your <strong>RTMP URL</strong></li>
            <li>Copy your <strong>Ключ потока</strong> (Stream Key)</li>
          </ol>
        </div>

        <div className="not-prose rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <h3 className="mb-2 text-sm font-semibold">💡 Pro Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• OK.ru popular among older demographics in Russia/CIS</li>
            <li>• Social integration with classmates and friends</li>
            <li>• Recommended: 720p at 3500-5000 kbps</li>
            <li>• Good for lifestyle and educational content</li>
          </ul>
        </div>
      </div>
    </>
  );
}
