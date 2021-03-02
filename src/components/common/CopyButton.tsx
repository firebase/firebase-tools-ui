/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        .catch(() => setIsTextCopied((isTextCopied) => isTextCopied));
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
