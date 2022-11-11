import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { Chip } from '@rmwc/chip';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import { CollapsibleList, List, ListItem, ListItemMeta } from '@rmwc/list';
import { TextField } from '@rmwc/textfield';
import { Tooltip } from '@rmwc/tooltip';
import {
  ExplicitParameterValue,
  RemoteConfigCondition,
  RemoteConfigParameter,
  RemoteConfigParameterValue,
  RemoteConfigTemplate,
} from 'firebase-admin/remote-config';
import React, { Suspense, useLayoutEffect, useRef, useState } from 'react';

import { CardActionBar } from '../common/CardActionBar';
import { useTemplate } from './api';
import styles from './RemoteConfig.module.scss';

const ParamFilter: React.FunctionComponent<{
  filter: string;
  setFilter: (newFilter: string) => void;
}> = ({ filter, setFilter }) => {
  const filterEl = useRef<HTMLInputElement>(null);

  function clear() {
    setFilter('');
  }

  // Focus on init and also on clear.
  useLayoutEffect(() => {
    if (filter === '') {
      filterEl.current?.focus();
    }
  }, [filter]);

  return (
    <form
      className={styles.filterForm}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <TextField
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setFilter(event.target.value);
        }}
        placeholder="Search parameters"
        value={filter}
        aria-label="filter"
        fullwidth
        type="text"
        inputRef={filterEl}
        outlined={false}
        ripple={false}
        icon="search"
        trailingIcon={
          filter && {
            icon: 'close',
            role: 'button',
            'aria-label': 'clear',
            onClick: clear,
          }
        }
      />
    </form>
  );
};

function remoteConfigParameterValueToString(
  paramValue: RemoteConfigParameterValue
) {
  if ('value' in paramValue) {
    return paramValue.value;
  } else {
    return 'In-app default';
  }
}

type ConditionDetails = RemoteConfigCondition & {
  value: RemoteConfigParameterValue;
};

const ParamConditionListItem: React.FunctionComponent<
  ConditionDetails & {
    isSelected: boolean;
    setSelectedCondition: Function;
  }
> = ({ name, value, expression, isSelected, setSelectedCondition }) => {
  return (
    <ListItem className={styles.rcListItem}>
      {/* <Tooltip content={<pre>{expression}</pre>} enterDelay={500}> */}
      <Chip
        label={name}
        selected={isSelected}
        checkmark={isSelected}
        onInteraction={() => setSelectedCondition()}
      />
      {/* </Tooltip> */}
      <span>Value: "{remoteConfigParameterValueToString(value)}"</span>
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
  defaultValue?: RemoteConfigParameterValue;
  conditions: ConditionDetails[];
  open: boolean;
}> = ({ name, defaultValue, conditions, open: defaultOpen }) => {
  if (!defaultValue && !conditions) {
    throw new Error('Parameter needs at least one value (I think)');
  }

  let servedValue: RemoteConfigParameterValue = (conditions.find(
    (conditionDetails) => conditionDetails.name === '!isEmulator'
  ) as ConditionDetails).value;

  const [open, setOpen] = useState<boolean | undefined>(undefined);

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

  const { template: currentTemplate, updateTemplate } = useTemplate();
  const setSelectedValue = async (value: RemoteConfigParameterValue) => {
    const newTemplate = { ...currentTemplate };
    // @ts-expect-error
    (newTemplate.parameters[name] as RemoteConfigParameter).conditionalValues[
      '!isEmulator'
    ] = value;

    try {
      updateTemplate(newTemplate);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CollapsibleList
      open={open !== undefined ? open : defaultOpen}
      handle={
        <ListItem
          className={styles.rcListItem}
          onClick={() => {
            return setOpen(open !== undefined ? !open : !defaultOpen);
          }}
        >
          <strong>{name}</strong>
          <span>
            Active value: "{remoteConfigParameterValueToString(servedValue)}"
          </span>
          <ListItemMeta icon="chevron_right" />
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

const ParamTable: React.FunctionComponent<{
  rcTemplate: RemoteConfigTemplate;
  paramNameFilter: string;
}> = ({ rcTemplate, paramNameFilter }) => {
  return (
    <List>
      {Object.keys(rcTemplate.parameters).map((paramName) => {
        // TODO: Filter on everything, not just paramName
        const openByDefault =
          paramNameFilter === '' ||
          paramName.toLowerCase().includes(paramNameFilter.toLowerCase());

        const { defaultValue, conditionalValues } = rcTemplate.parameters[
          paramName
        ];

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
              value: (conditionalValues as {
                [key: string]: RemoteConfigParameterValue;
              })[conditionName],
            } as ConditionDetails;
          }
          return {
            ...condition,
            value: (conditionalValues as {
              [key: string]: RemoteConfigParameterValue;
            })[conditionName],
          };
        });

        return (
          <ParamDetails
            key={paramName}
            name={paramName}
            defaultValue={defaultValue}
            conditions={conditions}
            open={openByDefault}
          />
        );
      })}
    </List>
  );
};

function RemoteConfig() {
  const { template } = useTemplate();

  const [paramNameFilter, setParamNameFilter] = useState('');

  return (
    <GridCell span={12}>
      <Elevation z="2" wrap>
        <Card>
          <CardActionBar>
            <ParamFilter
              filter={paramNameFilter}
              setFilter={setParamNameFilter}
            />
          </CardActionBar>
          <ParamTable rcTemplate={template} paramNameFilter={paramNameFilter} />
        </Card>
      </Elevation>
      <pre>{JSON.stringify(template, null, 2)}</pre>
    </GridCell>
  );
}

export default function RemoteConfigWrapper() {
  return (
    <Suspense fallback={'loading...'}>
      <RemoteConfig />
    </Suspense>
  );
}
