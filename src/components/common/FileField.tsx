import './Field.scss';
import './FileField.scss';

import { randomId } from '@rmwc/base';
import { Button } from '@rmwc/button';
import { ThemeProvider } from '@rmwc/theme';
import { HTMLProps } from '@rmwc/types';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { grey100 } from '../../colors';

type FileFieldProps = {
  tip?: string;
  error?: string;
  onFiles?: (files: File[]) => void;
} & HTMLProps<HTMLInputElement>;

const DROP_MESSAGE = 'Drop file(s) here';

export const FileField: React.FC<FileFieldProps> = ({
  label,
  tip,
  error,
  onFiles,
  value,
}) => {
  const [id] = useState(randomId());

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    onDrop: onFiles,
  });

  return (
    <div className="Field">
      {/* hidden input */}
      <Typography
        className="Field-label"
        use="body2"
        theme="secondary"
        tag="label"
        htmlFor={id}
      >
        {label}
      </Typography>

      <ThemeProvider
        options={{ surface: '#eee' }}
        className="Field-filename"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Typography use="body2" theme="secondary">
          {isDragActive ? DROP_MESSAGE : value}
        </Typography>
        <Button type="button">Browse</Button>
      </ThemeProvider>
      <div className="Field-subtext">
        {error ? (
          <Typography className="Field-tip" use="body2" theme="error">
            {error}
          </Typography>
        ) : (
          tip && (
            <Typography className="Field-tip" use="body2" theme="secondary">
              {tip}
            </Typography>
          )
        )}
      </div>
    </div>
  );
};
