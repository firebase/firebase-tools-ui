import { IconButton } from '@rmwc/icon-button';
import React, { useCallback, useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

function useClipboard(text: string) {
  const [isTextCopied, setIsTextCopied] = useState(false);
  return {
    isTextCopied,
    writeText: useCallback(() => {
      return navigator.clipboard
        .writeText(text)
        .then(() => setIsTextCopied(true))
        .catch(() => setIsTextCopied(isTextCopied => isTextCopied));
    }, [text]),
  };
}

export function CopyButton({ text, label }: CopyButtonProps) {
  label = label || 'Copy';
  const { writeText } = useClipboard(text);
  return <IconButton icon="content_copy" label={label} onClick={writeText} />;
}
