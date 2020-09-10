import { IconButton } from '@rmwc/icon-button';
import React from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

// TODO(davideast): Depend on pkg https://github.com/jaredLunde/react-hook/tree/master/packages/copy#readme
function useCopy(text: string) {
  const [copied, setCopied] = React.useState(false);
  const reset = React.useRef(() => setCopied(false));
  React.useEffect(() => reset.current, [text]);

  return {
    copied,
    copy: React.useCallback(
      () =>
        navigator.clipboard
          .writeText(text)
          .then(() => setCopied(true))
          .catch(() => setCopied(copied => copied)),
      [text]
    ),
    reset: reset.current,
  };
}

export function CopyButton({ text, label }: CopyButtonProps) {
  label = label || 'Copy';
  const { copy } = useCopy(text);
  return <IconButton icon="content_copy" label={label} onClick={copy} />;
}
