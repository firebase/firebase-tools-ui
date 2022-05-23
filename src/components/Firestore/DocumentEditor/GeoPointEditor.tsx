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

import firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';

import { Field } from '../../common/Field';

const GeoPointEditor: React.FC<
  React.PropsWithChildren<{
    name: string;
    value: firebase.firestore.GeoPoint;
    onChange: (value: firebase.firestore.GeoPoint) => void;
  }>
> = ({ name, value, onChange }) => {
  const [latitude, setLatitude] = useState(String(value.latitude));
  const [longitude, setLongitude] = useState(String(value.longitude));

  const latitudeName = `${name}-lat`;
  const longitudeName = `${name}-long`;

  useEffect(() => {
    const lat = Number(latitude);
    const long = Number(longitude);
    if (value.latitude === lat && value.longitude === long) {
      return;
    }

    try {
      // Update the parent when _both_ fields are valid
      const geoPoint = new firebase.firestore.GeoPoint(lat, long);
      onChange(geoPoint);
    } catch {}
  }, [value, latitude, longitude, onChange]);

  return (
    <div className="FieldEditor-geo-point">
      <Controller
        name={latitudeName}
        rules={{
          required: 'Required',
          min: {
            value: -90,
            message: 'Must be >= -90',
          },
          max: {
            value: 90,
            message: 'Must be <= -90',
          },
        }}
        render={({ field: { ref, ...field }, fieldState }) => (
          <Field
            label="Latitude"
            type="number"
            step="any"
            defaultValue={latitude}
            error={fieldState.isTouched && fieldState.error?.message}
            {...field}
            onChange={(e) => {
              field.onChange(e.currentTarget.value);
              setLatitude(e.currentTarget.value);
            }}
          />
        )}
      />

      <Controller
        name={longitudeName}
        rules={{
          required: 'Required',
          min: {
            value: -180,
            message: 'Must be >= -180',
          },
          max: {
            value: 180,
            message: 'Must be <= -180',
          },
        }}
        render={({ field: { ref, ...field }, fieldState }) => (
          <Field
            label="Longitude"
            type="number"
            step="any"
            defaultValue={longitude}
            error={fieldState.isTouched && fieldState.error?.message}
            {...field}
            onChange={(e) => {
              field.onChange(e.currentTarget.value);
              setLongitude(e.currentTarget.value);
            }}
          />
        )}
      />
    </div>
  );
};

export default GeoPointEditor;
