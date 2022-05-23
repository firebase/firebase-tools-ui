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

import { CircularProgress } from '@rmwc/circular-progress';
import React, { useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';
import styles from '../UserFormDialog.module.scss';

enum ImagePreviewStatus {
  NONE = 'NONE',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

export type ImageUrlInputProps = {
  ImageConstructor?: typeof Image;
};

export const ImageUrlInput: React.FC<
  React.PropsWithChildren<
    UseFormReturn<AddAuthUserPayload> & ImageUrlInputProps
  >
> = ({ register, watch, trigger, ImageConstructor }) => {
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
        trigger('photoUrl');
      }
    };
    img.onerror = () => {
      if (status.current === ImagePreviewStatus.LOADING) {
        status.current = ImagePreviewStatus.ERROR;
        setPreviewUrl('');
        trigger('photoUrl');
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [trigger]);

  useEffect(() => {
    if (photoUrl.trim() !== '') {
      status.current = ImagePreviewStatus.LOADING;
      imageUrlRef.current = photoUrl;
      image.current.src = photoUrl;
    } else {
      status.current = ImagePreviewStatus.NONE;
    }
    trigger('photoUrl');
  }, [photoUrl, trigger]);

  const validate = () => {
    return (
      status.current === ImagePreviewStatus.LOADED ||
      status.current === ImagePreviewStatus.NONE
    );
  };

  const { ref: photoUrlRef, ...photoUrlField } = register('photoUrl', {
    validate,
  });

  return (
    <>
      <Field
        label="User photo URL (optional)"
        placeholder="Enter URL"
        error={
          status.current === ImagePreviewStatus.ERROR && 'Error loading image'
        }
        type="text"
        inputRef={photoUrlRef}
        {...photoUrlField}
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
