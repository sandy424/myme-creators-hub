import { useEffect } from 'react';
import { useHub } from './HubContext';

// Only mark notifications for content that is actually open in a visible tab.
export function useReadNotices(ids) {
  const { markNoticesRead, notify, user } = useHub();
  const key = JSON.stringify(ids);
  useEffect(() => {
    if (!markNoticesRead || key === '[]') return;
    const read = () => {
      if (document.visibilityState === 'visible') {
        markNoticesRead(JSON.parse(key)).catch((error) => notify(error.message));
      }
    };
    read();
    document.addEventListener('visibilitychange', read);
    return () => document.removeEventListener('visibilitychange', read);
  }, [key, user?.id, markNoticesRead, notify]);
}
