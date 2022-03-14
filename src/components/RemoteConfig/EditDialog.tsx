import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from '@rmwc/dialog';
import { Typography } from '@rmwc/typography';
import {
  ExplicitParameterValue,
  RemoteConfigParameter,
  RemoteConfigParameterValue,
} from 'firebase-admin/remote-config';
import React, { useReducer } from 'react';

import { Field } from '../common/Field';

export type EditDialogProps = {
  open: boolean;
  close: () => void;
  parameterName: string;
  param: RemoteConfigParameter;
  save: (updatedParam: RemoteConfigParameter) => Promise<void>;
};

function ConditionField({
  label,
  value,
  update,
}: {
  label: string;
  value: ExplicitParameterValue;
  update: (newValue: string) => void;
}) {
  return (
    <Field
      name="parameterValue"
      label={label}
      type="text"
      onChange={(e) => {
        const newValue = (e.target as HTMLInputElement).value;
        update(newValue);
      }}
      value={value.value}
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
        <Typography use="body2">
          This will only change the value in the emulator
        </Typography>
        <ConditionField
          label="Default condition"
          value={editedParam.defaultValue as ExplicitParameterValue}
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
                    value={value as ExplicitParameterValue}
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
