/**
 * ErrorBanner.jsx
 *
 * Displays parse or validation errors from CSV adapters.
 *
 * @param {{ errors: string[] }} props
 */

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ErrorBanner({ errors }) {
  if (!errors || errors.length === 0) return null

  return (
    <div className="error-banner" role="alert" aria-live="polite">
      <p className="error-banner__title">
        <AlertIcon />
        {errors.length} CSV issue{errors.length > 1 ? 's' : ''}
      </p>
      <ul className="error-banner__list">
        {errors.map((e, i) => (
          <li key={i} className="error-banner__item">
            {e}
          </li>
        ))}
      </ul>
    </div>
  )
}
