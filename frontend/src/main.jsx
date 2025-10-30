import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PostHogProvider } from "posthog-js/react";
import { HelmetProvider } from "react-helmet-async";
import { CurrencyProvider } from "./contexts/CurrencyContext.jsx";

const options = {
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

ReactDOM.createRoot(document.getElementById("root")).render(
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
  </React.StrictMode>
);
