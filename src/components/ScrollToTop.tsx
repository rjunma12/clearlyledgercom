import { useEffect, forwardRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component scrolls the window to the top whenever the route changes.
 * This fixes the issue where navigating between pages keeps the previous scroll position.
 */
const ScrollToTop = forwardRef<HTMLDivElement>((_, ref) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <div ref={ref} style={{ display: 'none' }} />;
});

ScrollToTop.displayName = 'ScrollToTop';

export { ScrollToTop };
export default ScrollToTop;
