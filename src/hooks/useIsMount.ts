import { useRef, useEffect } from 'react';

/**
 * Hook to determine if the component is in its first mount
 * Returns true on first mount, false afterwards
 */
export function useIsMount() {
  const isMountRef = useRef(true);

  useEffect(() => {
    isMountRef.current = false;
  }, []);

  return isMountRef.current;
}