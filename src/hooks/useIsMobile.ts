import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = '(max-width: 768px)';

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_BREAKPOINT).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_BREAKPOINT);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return isMobile;
};
