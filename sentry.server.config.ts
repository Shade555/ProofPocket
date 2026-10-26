import * as Sentry from "@sentry/nextjs";

const isEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED !== "false" && Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);

if (isEnabled) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
