import * as Sentry from "@sentry/nextjs";

const isEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED !== "false" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

if (isEnabled) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Strip any accidental sensitive document strings
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((b) => {
          if (b.data?.text || b.data?.prompt) {
            delete b.data.text;
            delete b.data.prompt;
          }
          return b;
        });
      }
      return event;
    },
  });
}
