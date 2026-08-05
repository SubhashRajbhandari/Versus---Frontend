import '../index.css';

export default function LoadingOverlay({ isLoading, message = 'Loading...' }) {
  if (!isLoading) return null;

  return (
    <div className="vs-overlay-container" aria-live="polite">
      <div className="vs-overlay-content">
        <div className="vs-overlay-spinner"></div>
        {message && <p className="vs-overlay-message">{message}</p>}
      </div>
    </div>
  );
}
