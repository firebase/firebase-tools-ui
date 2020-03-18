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

import { TextField } from '@rmwc/textfield';
import { firestore } from 'firebase';
import React, { useEffect, useState } from 'react';

const GeoPointEditor: React.FC<{
  value: firestore.GeoPoint;
  onChange: (value: firestore.GeoPoint) => void;
}> = ({ value, onChange }) => {
  const [latitude, setLatitude] = useState(String(value.latitude));
  const [longitude, setLongitude] = useState(String(value.longitude));

  // Update the parent when _both_ fields are valid
  useEffect(() => {
    const lat = parseInt(latitude);
    const long = parseInt(longitude);
    if (!isNaN(lat) && !isNaN(long)) {
      onChange(new firestore.GeoPoint(lat, long));
    }
  }, [latitude, longitude, onChange]);

  return (
    <>
      <TextField
        outlined
        label="Latitude"
        value={latitude}
        type="number"
        onChange={e => {
          setLatitude(e.currentTarget.value);
        }}
      />
      <TextField
        outlined
        label="Longitude"
        value={longitude}
        type="number"
        onChange={e => {
          setLongitude(e.currentTarget.value);
        }}
      />
    </>
  );
};

export default GeoPointEditor;
