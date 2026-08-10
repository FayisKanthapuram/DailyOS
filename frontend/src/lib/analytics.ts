/**
 * DailyOS Analytics Abstraction Layer
 *
 * Provides a typed event-tracking interface that can be backed by any
 * analytics provider without changing call sites.
 *
 * Currently configured as a no-op (no provider active).
 * To activate a provider, set VITE_ANALYTICS_PROVIDER in your .env and
 * implement the corresponding case below.
 *
 * IMPORTANT — Privacy rules:
 * - Never track task titles, descriptions, notes, or any user-generated content.
 * - Never track email addresses or personal identifiers in event properties.
 * - Only track product interaction events useful for understanding usage patterns.
 */

type AnalyticsProperties = Record<string, string | number | boolean>;

type AnalyticsEvent =
  | 'landing_cta_click'
  | 'register_success'
  | 'login_success'
  | 'login_google_initiated'
  | 'task_created'
  | 'recurring_task_created'
  | 'task_completed'
  | 'task_skipped';

const provider = import.meta.env.VITE_ANALYTICS_PROVIDER ?? 'none';

function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (import.meta.env.DEV) {
    // Development: log to console only — never send to a remote endpoint
    console.debug('[analytics]', event, properties ?? {});
    return;
  }

  switch (provider) {
    case 'none':
      // No-op: analytics provider not configured
      break;

    case 'plausible':
      // Example Plausible integration:
      // (window as { plausible?: (event: string, opts?: { props?: object }) => void }).plausible?.(event, { props: properties });
      break;

    case 'umami':
      // Example Umami integration:
      // (window as { umami?: { track: (event: string, data?: object) => void } }).umami?.track(event, properties);
      break;

    default:
      break;
  }
}

export const analytics = {
  track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
    try {
      trackEvent(event, properties);
    } catch {
      // Analytics must never throw and break the app
    }
  },
};
