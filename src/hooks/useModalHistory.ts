import { useEffect, useRef } from 'react';

/**
 * Custom hook to intercept browser back-navigation events (swipes, back button)
 * to close open overlays instead of exiting the page.
 *
 * @param isOpen Indicates if the modal overlay is currently open.
 * @param onClose Callback function to close the modal overlay.
 */
export function useModalHistory(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    let statePushed = false;
    let stateId = '';

    // Defer pushState to the next tick to prevent Strict Mode double-mounting races
    const pushTimeout = setTimeout(() => {
      stateId = `modal-${Math.random().toString(36).substring(2, 9)}`;
      window.history.pushState({ stateId }, '');
      statePushed = true;
    }, 0);

    const handlePopState = () => {
      // Trigger onClose when the user goes back in history
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      clearTimeout(pushTimeout);
      window.removeEventListener('popstate', handlePopState);
      
      // Only navigate back if the state was actually pushed and is still current
      if (statePushed && window.history.state?.stateId === stateId) {
        window.history.back();
      }
    };
  }, [isOpen]);
}
