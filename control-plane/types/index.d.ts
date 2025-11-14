// Global Type Declarations

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      DB_HOST: string;
      DB_PORT?: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;

      JWT_SECRET: string;
      SESSION_SECRET: string;

      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      GOOGLE_CALLBACK_URL?: string;

      TWITCH_CLIENT_ID?: string;
      TWITCH_CLIENT_SECRET?: string;
      TWITCH_CALLBACK_URL?: string;

      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_SECURE?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
      FROM_EMAIL?: string;

      FRONTEND_URL?: string;
      STREAM_DOMAIN?: string;
      MEDIA_SERVER_HOST?: string;

      RAZORPAY_KEY_ID?: string;
      RAZORPAY_KEY_SECRET?: string;

      CORS_ORIGINS?: string;

      POSTHOG_API_KEY?: string;
      POSTHOG_HOST?: string;
    }
  }

  // Express Request user type
  interface AuthenticatedRequest extends Express.Request {
    user?: {
      id: number;
      uuid: string;
      email: string;
      displayName?: string;
      avatarUrl?: string;
      streamKey?: string;
      oauthProvider?: string;
      isPublic?: boolean;
    };
  }
}

export {};
