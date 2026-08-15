import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`vs-toast vs-toast-${type}`} role="alert">
      <div className="vs-toast-icon">
        {type === 'success' ? (
          <i className="fa-solid fa-circle-check"></i>
        ) : type === 'error' ? (
          <i className="fa-solid fa-circle-xmark"></i>
        ) : (
          <i className="fa-solid fa-circle-info"></i>
        )}
      </div>
      <div className="vs-toast-content">
        <span className="vs-toast-message">{message}</span>
      </div>
      <button className="vs-toast-close" onClick={onClose} aria-label="Close toast">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
}
