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

import { Chip } from '@rmwc/chip';
import { Grid, GridCell } from '@rmwc/grid';
import { IconButton } from '@rmwc/icon-button';
import { CollapsibleList, List, ListItem, ListItemMeta } from '@rmwc/list';
import { Radio } from '@rmwc/radio';
import { Theme, ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import type {
  ExplicitParameterValue,
  RemoteConfigCondition,
  RemoteConfigParameter,
  RemoteConfigParameterValue,
  RemoteConfigTemplate,
} from 'firebase-admin/remote-config';
import { useState } from 'react';

import { grey100 } from '../../colors';
import { remoteConfigParameterValueToString } from './api';
import { paramContainsSearchTerm } from './QueryBar';
import styles from './RemoteConfig.module.scss';
import type { ConditionDetails } from './types';

const ParamConditionListItem: React.FunctionComponent<
  ConditionDetails & {
    isSelected: boolean;
    setSelectedCondition: Function;
  }
> = ({ name, value, tagColor, isSelected, setSelectedCondition }) => {
  return (
    <ListItem className={styles.rcListItem}>
      <Grid className={styles.parameterListItemGrid}>
        <GridCell span={1} />
        <GridCell span={2} />

        <GridCell span={3} className={styles.paramListHeaderGridItem}>
          <Chip
            className={
              tagColor
                ? styles[`condition_color_${tagColor.toLowerCase()}`]
                : ''
            }
            label={name}
            selected={isSelected}
            disabled
          />
        </GridCell>

        <GridCell span={5} className={styles.paramListHeaderGridItem}>
          <Radio
            value={remoteConfigParameterValueToString(value)}
            checked={isSelected}
            onChange={() => setSelectedCondition()}
          >
            {remoteConfigParameterValueToString(value)}
          </Radio>
        </GridCell>
        <GridCell span={1} />
      </Grid>
    </ListItem>
  );
};

function checkEqual(
  a: RemoteConfigParameterValue,
  b: RemoteConfigParameterValue
) {
  return (
    (a as ExplicitParameterValue).value === (b as ExplicitParameterValue).value
  );
}

const ParamDetails: React.FunctionComponent<{
  name: string;
  template: RemoteConfigTemplate;
  defaultValue?: RemoteConfigParameterValue;
  conditions: ConditionDetails[];
  edit: () => {};
  setEditTemplate: (template: any) => any;
}> = ({ name, template, defaultValue, conditions, edit, setEditTemplate }) => {
  if (!defaultValue && !conditions) {
    throw new Error('Parameter needs at least one value (I think)');
  }

  let servedValue: RemoteConfigParameterValue = (
    conditions.find(
      (conditionDetails) => conditionDetails.name === '!isEmulator'
    ) as ConditionDetails
  ).value;

  const [expanded, setExpanded] = useState<boolean>(false);

  if (defaultValue) {
    conditions = [
      {
        name: 'Default',
        expression: 'Default',
        value: defaultValue,
      },
      ...(conditions ?? []),
    ];
  }

  const setSelectedValue = async (value: RemoteConfigParameterValue) => {
    const newTemplate = JSON.parse(JSON.stringify(template));
    // @ts-expect-error
    (newTemplate.parameters[name] as RemoteConfigParameter).conditionalValues[
      '!isEmulator'
    ] = value;

    try {
      setEditTemplate(newTemplate);
    } catch (e) {
      console.error(e);
    }
  };

  let activeConditionName = 'Default';
  let activeConditionValue: RemoteConfigParameterValue =
    defaultValue as RemoteConfigParameterValue;
  let activeConditionColor: RemoteConfigCondition['tagColor'] | undefined =
    undefined;
  for (let condition of conditions) {
    if (
      condition.name !== '!isEmulator' &&
      checkEqual(condition.value, servedValue)
    ) {
      activeConditionName = condition.name;
      activeConditionValue = condition.value;

      if (condition.tagColor) {
        activeConditionColor = condition.tagColor;
      }
    }
  }

  return (
    <CollapsibleList
      open={expanded}
      handle={
        <ListItem
          className={styles.rcListItem}
          onClick={() => {
            return setExpanded(!expanded);
          }}
        >
          <Grid className={styles.parameterListItemGrid}>
            <GridCell span={3} className={styles.paramListHeaderGridItem}>
              <ListItemMeta
                icon="chevron_right"
                className={styles.listItemExpandIndicator}
              />
              <Typography
                use="body1"
                className={styles.remoteConfigParameterName}
              >
                {name}
              </Typography>
            </GridCell>
            <GridCell span={3} className={styles.paramListHeaderGridItem}>
              <Chip
                className={
                  activeConditionColor
                    ? styles[
                        `condition_color_${activeConditionColor.toLowerCase()}`
                      ]
                    : ''
                }
                label={activeConditionName}
                selected={true}
                checkmark={true}
                disabled
              />
            </GridCell>

            <GridCell span={5} className={styles.paramListHeaderGridItem}>
              {remoteConfigParameterValueToString(activeConditionValue)}
            </GridCell>
            <GridCell span={1} className={styles.paramListHeaderGridItem}>
              <IconButton
                className={styles.conditionEditButton}
                icon="edit"
                aria-label="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  edit();
                }}
              />
            </GridCell>
          </Grid>
        </ListItem>
      }
    >
      {conditions ? (
        conditions
          .filter((condition) => condition.name !== '!isEmulator')
          .map((condition) => {
            return (
              <ParamConditionListItem
                isSelected={checkEqual(condition.value, servedValue)}
                setSelectedCondition={() => setSelectedValue(condition.value)}
                key={condition.name}
                {...condition}
              />
            );
          })
      ) : (
        <></>
      )}
    </CollapsibleList>
  );
};

export const TemplateViewer: React.FunctionComponent<{
  rcTemplate: RemoteConfigTemplate;
  paramNameFilter: string;
  editParam: (paramName: string) => any;
  setEditTemplate: (template: any) => any;
}> = ({ rcTemplate, paramNameFilter, editParam, setEditTemplate }) => {
  return (
    <>
      <ThemeProvider
        options={{ surface: grey100 }}
        className={styles.paramListHeader}
      >
        <Theme
          use={['surface']}
          className={styles.paramListHeaderInner}
          tag="div"
        >
          <Grid align="left" className={styles.paramListHeaderGrid}>
            <GridCell span={1} />
            <GridCell span={2} className={styles.paramListHeaderGridItem}>
              <Typography use="subtitle2">Name</Typography>
            </GridCell>
            <GridCell span={3} className={styles.paramListHeaderGridItem}>
              <Typography use="subtitle2">Conditions</Typography>
            </GridCell>
            <GridCell span={5} className={styles.paramListHeaderGridItem}>
              <Typography use="subtitle2">Value</Typography>
            </GridCell>
            <GridCell span={1} className={styles.paramListHeaderGridItem}>
              <Typography use="subtitle2">Actions</Typography>
            </GridCell>
          </Grid>
        </Theme>
      </ThemeProvider>
      <List className={styles.paramListContents}>
        {Object.keys(rcTemplate.parameters)
          .filter((paramName) => {
            const param = rcTemplate.parameters[paramName];
            return (
              paramNameFilter === '' ||
              paramContainsSearchTerm(paramNameFilter, paramName, param)
            );
          })
          .map((paramName) => {
            const param = rcTemplate.parameters[paramName];
            const { defaultValue, conditionalValues } = param;

            const conditions = Object.keys(
              conditionalValues as {
                [key: string]: RemoteConfigParameterValue;
              }
            ).map((conditionName) => {
              let condition = rcTemplate.conditions.find(
                (rcCondition) => rcCondition.name === conditionName
              );

              if (!condition) {
                return {
                  name: conditionName,
                  value: (
                    conditionalValues as {
                      [key: string]: RemoteConfigParameterValue;
                    }
                  )[conditionName],
                } as ConditionDetails;
              }
              return {
                ...condition,
                value: (
                  conditionalValues as {
                    [key: string]: RemoteConfigParameterValue;
                  }
                )[conditionName],
              };
            });

            return (
              <ParamDetails
                key={paramName}
                name={paramName}
                template={rcTemplate}
                defaultValue={defaultValue}
                conditions={conditions}
                edit={() => editParam(paramName)}
                setEditTemplate={setEditTemplate}
              />
            );
          })}
      </List>
    </>
  );
};
