import posthog from 'posthog-js';

/**
 * Analytics event tracking helper function wrapping PostHog.
 * Can be used across the application to track custom user actions.
 * 
 * Example usage:
 *   track("login")
 *   track("register_organization")
 *   track("generate_report")
 *   track("run_ai_analysis")
 *   track("view_dashboard")
 */
export function track(eventName: string, properties?: Record<string, any>): void {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  if (apiKey) {
    posthog.capture(eventName, properties);
  }
}

export default track;
