import { IconButton, IconButtonProps } from '@rmwc/icon-button';
import { HTMLProps } from '@rmwc/types';
import React, { useCallback, useState } from 'react';

interface CopyButtonProps extends HTMLProps<IconButtonProps> {
  textToCopy: string;
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

export function CopyButton({
  textToCopy: text,
  label,
  theme,
}: CopyButtonProps) {
  label = label || 'Copy';
  theme = theme || 'textPrimaryOnBackground';
  const { writeText } = useClipboard(text);
  return (
    <IconButton
      theme={theme}
      icon="content_copy"
      label={label}
      onClick={writeText}
    />
  );
}
