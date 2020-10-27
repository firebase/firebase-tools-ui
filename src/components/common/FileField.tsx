import './Field.scss';
import './FileField.scss';

import { randomId } from '@rmwc/base';
import { Button } from '@rmwc/button';
import { HTMLProps } from '@rmwc/types';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

type FileFieldProps = {
  tip?: string;
  error?: string;
  onFiles?: (files: File[]) => void;
} & HTMLProps<HTMLInputElement>;

const DROP_MESSAGE = 'Drop file(s) here';
const INVALID_FILE_MESSAGE = 'File type is not accepted';

export const FileField: React.FC<FileFieldProps> = ({
  label,
  tip,
  error,
  onFiles,
  value,
  accept,
}) => {
  const [id] = useState(randomId());

  const {
    isDragActive,
    getRootProps,
    getInputProps,
    isDragReject,
  } = useDropzone({
    onDrop: onFiles,
    accept,
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

      <div
        className="Field-filename"
        {...getRootProps()}
        data-testid="dropzone"
      >
        <input {...getInputProps({ id })} />
        <Typography use="body2" theme="secondary">
          {isDragActive
            ? isDragReject
              ? INVALID_FILE_MESSAGE
              : DROP_MESSAGE
            : value}
        </Typography>
        <Button type="button">Browse</Button>
      </div>
      <div className="Field-subtext">
        {error ? (
          <Typography
            className="Field-tip"
            use="body2"
            theme="error"
            role="alert"
          >
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
