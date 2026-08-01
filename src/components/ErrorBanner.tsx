interface ErrorBannerProps {
  message: string;
}

/** Defense in depth: form validation should prevent this, but if a
 * calculator ever throws on stored data, show it instead of a blank
 * screen or a stack trace. */
export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="banner banner--danger" role="alert" data-testid="account-error-banner">
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
