import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { Chip } from '@rmwc/chip';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import {
  CollapsibleList,
  List,
  ListItem,
  ListItemMeta
} from '@rmwc/list';
import { TextField } from '@rmwc/textfield';
import {
  RemoteConfigCondition,
  RemoteConfigParameterValue,
  RemoteConfigTemplate
} from 'firebase-admin/remote-config';
import React, {
  Suspense, useLayoutEffect, useRef,
  useState
} from 'react';
import { CardActionBar } from '../common/CardActionBar';
import { useTemplate, useTemplateUpdater } from './api';
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
        placeholder="Filter parameters"
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
    selectedCondition: string;
    setSelectedCondition: (conditionName: string) => void;
  }
> = ({ name, value, expression, selectedCondition, setSelectedCondition }) => {
  return (
    <ListItem className={styles.rcListItem}>
      <Chip
        label={expression}
        selected={name === selectedCondition}
        checkmark={name === selectedCondition}
        onInteraction={() => setSelectedCondition(name)}
      />
      <span>Value: "{remoteConfigParameterValueToString(value)}"</span>
    </ListItem>
  );
};

const ParamDetails: React.FunctionComponent<{
  name: string;
  defaultValue?: RemoteConfigParameterValue;
  conditions?: ConditionDetails[];
  open: boolean;
}> = ({ name, defaultValue, conditions, open: defaultOpen }) => {
  if (!defaultValue && !conditions) {
    throw new Error('Parameter needs at least one value (I think)');
  }

  const [open, setOpen] = useState<boolean | undefined>(undefined);

  const [selectedConditionName, setSelectedCondition] = useState(() => {
    if (defaultValue) {
      return 'Default';
    } else {
      return (conditions as ConditionDetails[])[0].name;
    }
  });

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

  const selectedConditionValue = conditions?.find(
    (condition) => condition.name === selectedConditionName
  )?.value;

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
          {defaultValue ? (
            <span>
              Default: "{remoteConfigParameterValueToString(defaultValue)}"
            </span>
          ) : (
            <></>
          )}
          <span>
            Active value: "
            {remoteConfigParameterValueToString(
              selectedConditionValue as RemoteConfigParameterValue
            )}
            "
          </span>
          <ListItemMeta icon="chevron_right" />
        </ListItem>
      }
    >
      {conditions ? (
        conditions.map((condition) => {
          return (
            <ParamConditionListItem
              selectedCondition={selectedConditionName}
              setSelectedCondition={setSelectedCondition}
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
        const openByDefault =
          paramNameFilter === '' ||
          paramName.toLowerCase().includes(paramNameFilter.toLowerCase());

        const { defaultValue, conditionalValues } = rcTemplate.parameters[
          paramName
        ];

        const conditions = conditionalValues
          ? Object.keys(conditionalValues).map((conditionName) => {
              return {
                ...(rcTemplate.conditions.find(
                  (rcCondition) => rcCondition.name === conditionName
                ) as RemoteConfigCondition),
                value: conditionalValues[conditionName],
              };
            })
          : undefined;

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
  const { template, fetchNewTemplate } = useTemplate();
  const templateUpdater = useTemplateUpdater();

  const [paramNameFilter, setParamNameFilter] = useState('');

  async function updateTemplate() {
    // generate an updated template for testing
    const newTemplate = JSON.parse(JSON.stringify(template));
    newTemplate.parameters = newTemplate.parameters || {};

    newTemplate.parameters['welcome_message'] = {
      defaultValue: {
        value: 'Hello world!',
      },
    };

    try {
      await templateUpdater(newTemplate);
      fetchNewTemplate();
    } catch (e) {
      console.error(e);
    }
  }

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
      <Button onClick={updateTemplate} outlined={true}>
        Update template
      </Button>

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
