import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component scrolls the window to the top whenever the route changes.
 * Skips the initial mount (browser is already at top) and defers the scroll to
 * the next animation frame to avoid forced reflows during React's commit phase.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const id = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
