/**
 * Copyright 2019 Google LLC
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

import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from '@rmwc/dialog';
import { Typography } from '@rmwc/typography';
import { useReducer } from 'react';

import { Field } from '../common/Field';
import styles from './RemoteConfig.module.scss';

import type {
  RemoteConfigParameter,
  RemoteConfigParameterValue,
} from 'firebase-admin/remote-config';

export type EditDialogProps = {
  open: boolean;
  close: () => void;
  parameterName: string;
  param: RemoteConfigParameter;
  save: (updatedParam: RemoteConfigParameter) => Promise<void>;
};

function ConditionField({
  label,
  conditionValue,
  update,
}: {
  label: string;
  conditionValue: RemoteConfigParameterValue;
  update: (newValue: string) => void;
}) {
  let valueStr;
  let disabled;

  if ('value' in conditionValue) {
    disabled = false;
    valueStr = conditionValue.value;
  } else {
    disabled = true;
    valueStr = 'In-app default';
  }
  return (
    <Field
      name="parameterValue"
      disabled={disabled}
      label={label}
      type="text"
      onChange={(e) => {
        const newValue = (e.target as HTMLInputElement).value;
        update(newValue);
      }}
      value={valueStr}
    />
  );
}

export default function EditDialog({
  open,
  close,
  param,
  parameterName,
  save,
}: EditDialogProps) {
  const [editedParam, updateCondition] = useReducer(
    (
      param: RemoteConfigParameter,
      action: { conditionName: string; conditionValue: string }
    ) => {
      const updatedParam: RemoteConfigParameter = { ...param };

      if (action.conditionName === 'DEFAULT') {
        updatedParam.defaultValue = {
          value: action.conditionValue,
        };

        if (updatedParam.conditionalValues) {
          updatedParam.conditionalValues['!isEmulator'] = {
            value: action.conditionValue,
          };
        }
      } else {
        if (updatedParam.conditionalValues) {
          updatedParam.conditionalValues[action.conditionName] = {
            value: action.conditionValue,
          };
        }
      }
      return updatedParam;
    },
    param
  );
  return (
    <Dialog
      open={open}
      onClose={(event) => {
        if (event.detail.action === 'save') {
          save(editedParam);
        } else {
          close();
        }
      }}
    >
      <DialogTitle>Edit values for {parameterName}</DialogTitle>
      <DialogContent>
        <div className={styles.explainerSection}>
          <Typography use="body1">
            This will only change the value in the emulator.
          </Typography>
        </div>
        <ConditionField
          label="Default condition"
          conditionValue={
            editedParam.defaultValue as RemoteConfigParameterValue
          }
          update={(newValue: string) => {
            updateCondition({
              conditionName: 'DEFAULT',
              conditionValue: newValue,
            });
          }}
        />
        {param.conditionalValues !== undefined
          ? Object.keys(param.conditionalValues)
              .filter((conditionName) => conditionName !== '!isEmulator')
              .map((conditionName) => {
                if (!param.conditionalValues) {
                  return;
                }
                const value: RemoteConfigParameterValue =
                  param.conditionalValues[conditionName];

                return (
                  <ConditionField
                    key={conditionName}
                    label={conditionName}
                    conditionValue={value}
                    update={(newValue: string) => {
                      updateCondition({
                        conditionName,
                        conditionValue: newValue,
                      });
                    }}
                  />
                );
              })
          : null}
      </DialogContent>
      <DialogActions>
        <DialogButton action="close">Cancel</DialogButton>
        <DialogButton action="save" isDefaultAction>
          Save
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
}
