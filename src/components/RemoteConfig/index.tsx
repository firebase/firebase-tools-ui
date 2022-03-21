import { Card } from '@rmwc/card';
import { Chip } from '@rmwc/chip';
import { Elevation } from '@rmwc/elevation';
import { Grid, GridCell } from '@rmwc/grid';
import { IconButton } from '@rmwc/icon-button';
import { CollapsibleList, List, ListItem, ListItemMeta } from '@rmwc/list';
import { Radio } from '@rmwc/radio';
import { TextField } from '@rmwc/textfield';
import { Theme, ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import {
  ExplicitParameterValue,
  RemoteConfigCondition,
  RemoteConfigParameter,
  RemoteConfigParameterValue,
  RemoteConfigTemplate,
} from 'firebase-admin/remote-config';
import React, { Suspense, useLayoutEffect, useRef, useState } from 'react';

import { grey100 } from '../../colors';
import { CardActionBar } from '../common/CardActionBar';
import { useTemplate } from './api';
import EditDialog from './EditDialog';
import styles from './RemoteConfig.module.scss';
import ResetButton from './Reset';

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
      <Grid className={styles.parameterListItemGrid}>
        <GridCell span={1} />
        <GridCell span={2} />

        <GridCell span={3} className={styles.paramListHeaderGridItem}>
          <Chip label={name} selected={isSelected} disabled />
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
  defaultValue?: RemoteConfigParameterValue;
  conditions: ConditionDetails[];
  edit: () => {};
}> = ({ name, defaultValue, conditions, edit }) => {
  if (!defaultValue && !conditions) {
    throw new Error('Parameter needs at least one value (I think)');
  }

  let servedValue: RemoteConfigParameterValue = (conditions.find(
    (conditionDetails) => conditionDetails.name === '!isEmulator'
  ) as ConditionDetails).value;

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
                label={'Default'}
                selected={true}
                checkmark={true}
                onInteraction={console.log}
              />
            </GridCell>

            <GridCell span={5} className={styles.paramListHeaderGridItem}>
              {remoteConfigParameterValueToString(servedValue)}
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

/**
 * returns whether a parameter contains a search term in its name, condition names, or condition values
 *
 * @param searchTerm the search string
 * @param paramName the name of the RC parameter
 * @param param the RC parameter to search through
 * @returns whether or not the search term was found
 */
function paramContainsSearchTerm(
  searchTerm: string,
  paramName: string,
  param: RemoteConfigParameter
): boolean {
  function matchesSearch(str: string) {
    if (!str || !searchTerm) {
      debugger;
    }
    return str.toLowerCase().includes(searchTerm.toLowerCase());
  }

  if (matchesSearch(paramName)) {
    return true;
  }

  if (
    matchesSearch(
      remoteConfigParameterValueToString(
        param.defaultValue as RemoteConfigParameterValue
      )
    )
  ) {
    return true;
  }

  for (let conditionName in param.conditionalValues) {
    if (matchesSearch(conditionName)) {
      return true;
    }

    if (
      matchesSearch(
        remoteConfigParameterValueToString(
          param.conditionalValues[conditionName] as RemoteConfigParameterValue
        )
      )
    ) {
      return true;
    }
  }
  return false;
}

const ParamTable: React.FunctionComponent<{
  rcTemplate: RemoteConfigTemplate;
  paramNameFilter: string;
  editParam: (paramName: string) => any;
}> = ({ rcTemplate, paramNameFilter, editParam }) => {
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
                edit={() => editParam(paramName)}
              />
            );
          })}
      </List>
    </>
  );
};

function RemoteConfig() {
  const { template, updateTemplate, revertTemplate } = useTemplate();

  const [searchText, setSearchText] = useState('');
  const [paramBeingEdited, editParam] = useState<string | undefined>(undefined);

  return (
    <GridCell span={12}>
      <div className={styles.topActions}>
        <ResetButton reset={revertTemplate} />
      </div>
      <Elevation z="2" wrap>
        <Card>
          <CardActionBar>
            <ParamFilter filter={searchText} setFilter={setSearchText} />
          </CardActionBar>
          <ParamTable
            rcTemplate={template}
            paramNameFilter={searchText}
            editParam={(paramName: string) => editParam(paramName)}
          />
          {paramBeingEdited !== undefined ? (
            <EditDialog
              open={paramBeingEdited !== undefined}
              close={() => editParam(undefined)}
              parameterName={paramBeingEdited as string}
              param={template.parameters[paramBeingEdited]}
              save={async (updatedParam: RemoteConfigParameter) => {
                const newTemplate: RemoteConfigTemplate = { ...template };
                newTemplate.parameters[paramBeingEdited] = updatedParam;
                await updateTemplate({ ...template });
                editParam(undefined);
              }}
            />
          ) : null}
        </Card>
      </Elevation>
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
