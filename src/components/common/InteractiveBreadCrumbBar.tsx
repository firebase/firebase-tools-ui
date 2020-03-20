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

import { Button } from '@rmwc/button';
import { Elevation } from '@rmwc/elevation';
import { TextField } from '@rmwc/textfield';
import React, { useState } from 'react';

import { Props as BreadCrumbProps, BreadCrumbs } from './BreadCrumbs';
import { CardActionBar } from './CardActionBar';

interface Props extends BreadCrumbProps {
  onNavigate: (path: string) => void;
}

export const InteractiveBreadCrumbBar: React.FC<Props> = ({
  onNavigate,
  children,
  ...breadCrumbProps
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(breadCrumbProps.path);

  const handleSubmit = () => {
    const normalizedPath = value.startsWith('/') ? value.substr(1) : value;
    onNavigate(normalizedPath);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(breadCrumbProps.path);
  };

  return (
    <div className="InteractiveBreadCrumbBar">
      {isEditing ? (
        <Elevation z={2} wrap>
          <form
            className="InteractiveBreadCrumbBar-form"
            onSubmit={() => handleSubmit()}
          >
            <TextField
              placeholder="Path"
              fullwidth
              className="value"
              type="text"
              value={value}
              onChange={e => setValue(e.currentTarget.value)}
            />
            <Button
              type="button"
              onClick={handleCancel}
              theme="textSecondaryOnLight"
            >
              Cancel
            </Button>
            <Button type="submit">Go</Button>
          </form>
        </Elevation>
      ) : (
        <CardActionBar>
          <BreadCrumbs {...breadCrumbProps} onEdit={() => setIsEditing(true)}>
            {children}
          </BreadCrumbs>
        </CardActionBar>
      )}
    </div>
  );
};
