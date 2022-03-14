import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from '@rmwc/dialog';
import { Typography } from '@rmwc/typography';
import {
  RemoteConfigParameter,
  RemoteConfigParameterValue,
} from 'firebase-admin/remote-config';
import React, { useReducer } from 'react';

import { Field } from '../common/Field';
import styles from './RemoteConfig.module.scss';

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
