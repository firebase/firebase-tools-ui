/**
 * Copyright 2020 Google LLC
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

import './InteractiveBreadCrumbBar.scss';

import { Elevation } from '@rmwc/elevation';
import { IconButton } from '@rmwc/icon-button';
import { TextField } from '@rmwc/textfield';
import { Typography } from '@rmwc/typography';
import useKey from '@rooks/use-key';
import React, { useLayoutEffect, useRef, useState } from 'react';

import { Props as BreadCrumbProps, BreadCrumbs } from './BreadCrumbs';
import { CardActionBar } from './CardActionBar';

interface Props extends BreadCrumbProps {
  /** The input prefix to show before the editable input */
  inputPrefix?: string;
  onNavigate: (path: string) => void;
}

export const InteractiveBreadCrumbBar: React.FC<Props> = ({
  onNavigate,
  children,
  inputPrefix,
  ...breadCrumbProps
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(breadCrumbProps.path);

  const handleSubmit = () => {
    const normalizedPath = value.startsWith('/') ? value.substr(1) : value;
    onNavigate(normalizedPath);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(breadCrumbProps.path);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useKey(['Escape'], handleCancel, {
    eventTypes: ['keypress', 'keydown', 'keyup'],
    target: inputRef,
    when: true,
  });

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing, inputRef]);

  return (
    <div className="InteractiveBreadCrumbBar">
      {isEditing ? (
        <Elevation z={1} wrap>
          <form
            className="InteractiveBreadCrumbBar-form"
            onSubmit={() => handleSubmit()}
          >
            {inputPrefix && (
              <Typography
                use="body2"
                className="InteractiveBreadCrumbBar-prefix"
                tag="code"
                theme="textSecondaryOnBackground"
              >
                {inputPrefix}
              </Typography>
            )}
            <TextField
              aria-label="Document path"
              fullwidth
              className="value"
              type="text"
              value={value}
              onChange={e => setValue(e.currentTarget.value)}
              inputRef={inputRef}
            />
            <IconButton
              label="Cancel"
              type="button"
              icon="close"
              onClick={handleCancel}
              theme="textSecondaryOnLight"
            />
          </form>
        </Elevation>
      ) : (
        <CardActionBar className="top">
          <BreadCrumbs {...breadCrumbProps} onEdit={handleEdit}>
            {children}
          </BreadCrumbs>
        </CardActionBar>
      )}
    </div>
  );
};
