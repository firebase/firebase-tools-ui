import { randomId } from '@rmwc/base';
import { TextField, TextFieldProps } from '@rmwc/textfield';
import { HTMLProps } from '@rmwc/types';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

type FileFieldProps = {
  tip?: string;
  error?: string;
  onFiles?: (files: File[]) => void;
} & TextFieldProps &
  HTMLProps<HTMLInputElement>;

const DROP_MESSAGE = 'Drop file(s) here';

export const FileField: React.FC<FileFieldProps> = ({
  label,
  // strip outlined bool, always use outlined
  outlined,
  type,
  tip,
  error,
  onFiles,
  value,
  ...otherProps
}) => {
  const [id] = useState(randomId());

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    onDrop: onFiles,
  });

  return (
    <div className="Field" {...getRootProps()}>
      {/* hidden input */}
      <input {...getInputProps()} />
      <Typography
        className="Field-label"
        use="body2"
        theme="secondary"
        tag="label"
        htmlFor={id}
      >
        {label}
      </Typography>
      <TextField
        {...otherProps}
        outlined
        id={id}
        disabled
        value={isDragActive ? DROP_MESSAGE : value}
      />
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
