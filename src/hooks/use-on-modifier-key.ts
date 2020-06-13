import { useEffect } from 'react';

export default function useOnModifierKey(
  key: string,
  callback: Function,
  options: { ctrlKey?: boolean; metaKey?: boolean } = { ctrlKey: true }
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey && options.ctrlKey) || (e.metaKey && options.metaKey)) {
        if (e.key === key) {
          callback();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback, options, key]);
}
