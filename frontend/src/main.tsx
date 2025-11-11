import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { PostHogProvider } from "posthog-js/react";
import { HelmetProvider } from "react-helmet-async";
import { CurrencyProvider } from "./contexts/CurrencyContext.jsx";

interface PostHogOptions {
  api_host: string;
  capture_pageview: boolean;
  capture_pageleave: boolean;
  session_recording: {
    maskAllInputs: boolean;
    maskInputOptions: {
      password: boolean;
      email: boolean;
    };
  };
}

const options: PostHogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  capture_pageview: false, // We'll handle pageviews manually
  capture_pageleave: true,
  session_recording: {
    maskAllInputs: false,
    maskInputOptions: {
      password: true,
      email: true,
    },
  },
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <CurrencyProvider>
      <HelmetProvider>
        <PostHogProvider
          apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
          options={options}
        >
          <App />
        </PostHogProvider>
      </HelmetProvider>
    </CurrencyProvider>
  </React.StrictMode>,
);
