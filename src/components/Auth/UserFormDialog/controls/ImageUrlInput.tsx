import { CircularProgress } from '@rmwc/circular-progress';
import React, { useEffect, useRef, useState } from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';
import styles from '../UserFormDialog.module.scss';

enum ImagePreviewStatus {
  NONE = 'NONE',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

export interface ImageUrlInput {
  ImageConstructor?: typeof Image;
}

export type ImageUrlInputProps = ImageUrlInput &
  FormContextValues<AddAuthUserPayload>;
export const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  register,
  watch,
  triggerValidation,
  ImageConstructor,
}) => {
  ImageConstructor = ImageConstructor || Image;
  const [previewUrl, setPreviewUrl] = useState('');
  const image = useRef(new ImageConstructor());
  const imageUrlRef = useRef('');
  const status = useRef(ImagePreviewStatus.NONE);
  const photoUrl = watch('photoUrl') || '';

  useEffect(() => {
    const img = image.current;

    img.onload = () => {
      if (status.current === ImagePreviewStatus.LOADING) {
        status.current = ImagePreviewStatus.LOADED;
        setPreviewUrl(imageUrlRef.current);
        triggerValidation('photoUrl');
      }
    };
    img.onerror = () => {
      if (status.current === ImagePreviewStatus.LOADING) {
        status.current = ImagePreviewStatus.ERROR;
        setPreviewUrl('');
        triggerValidation('photoUrl');
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [triggerValidation]);

  useEffect(() => {
    if (photoUrl.trim() !== '') {
      status.current = ImagePreviewStatus.LOADING;
      imageUrlRef.current = photoUrl;
      image.current.src = photoUrl;
    } else {
      status.current = ImagePreviewStatus.NONE;
    }
    triggerValidation('photoUrl');
  }, [photoUrl, triggerValidation]);

  const validate = () => {
    return (
      status.current === ImagePreviewStatus.LOADED ||
      status.current === ImagePreviewStatus.NONE
    );
  };

  return (
    <>
      <Field
        name="photoUrl"
        label="User Photo URL (optional)"
        placeholder="Enter URL"
        error={
          status.current === ImagePreviewStatus.ERROR && 'Error loading image'
        }
        type="text"
        inputRef={register({ validate })}
      />
      {status.current === ImagePreviewStatus.LOADED && (
        <img className={styles.image} src={previewUrl} alt="Profile preview" />
      )}
      {status.current === ImagePreviewStatus.LOADING && (
        <div
          className={styles.imageWrapper}
          aria-busy="true"
          aria-live="polite"
          data-testid="spinner"
        >
          <CircularProgress size="large" />
        </div>
      )}
    </>
  );
};
