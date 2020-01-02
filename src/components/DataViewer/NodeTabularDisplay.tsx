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

import './NodeTabularDisplay.scss';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableRow,
  DataTableHeadCell,
  DataTableBody,
  DataTableCell,
} from '@rmwc/data-table';
import { Button } from '@rmwc/button';
import { Typography } from '@rmwc/typography';
import { DEFAULT_PAGE_SIZE } from './common/view_model';
import { ValueDisplay } from './ValueDisplay';

export interface Props {
  hasMoreRows?: boolean;
  realtimeRef: firebase.database.Reference;
  limit: number;
  onLoadMore?: () => void;
}

enum TableType {
  KeyValue = 'kvp',
  KeyObject = 'ko',
  Array = 'arr',
}

interface Table {
  type: TableType;
  headers: string[];
  rows: { pkId: string; value: any }[];
}

export const NodeTabularDisplay = React.memo<Props>(
  function NodeTabularDisplay$({
    realtimeRef,
    limit,
    hasMoreRows,
    onLoadMore,
  }) {
    const [table, setTable] = useState<Table>({
      type: TableType.Array,
      headers: [],
      rows: [],
    });

    const raiseOnLoadMore = () => onLoadMore && onLoadMore();

    useEffect(() => {
      (async () => {
        setTable(await buildTable(realtimeRef, limit));
      })();
    }, [realtimeRef, limit]);

    return (
      <DataTable className="NodeTabularDisplay">
        <DataTableContent>
          <DataTableHead>
            <DataTableRow>
              {table.headers.map((header, i) => (
                <DataTableHeadCell key={i}>
                  <Typography use="body1">{header}</Typography>
                </DataTableHeadCell>
              ))}
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {table.rows.map((row, idx) => (
              <DataTableRow key={idx}>
                {table.headers.map((header, i) =>
                  getColumnValue(table, row, header, i)
                )}
              </DataTableRow>
            ))}
          </DataTableBody>
          {hasMoreRows && (
            <DataTableHead>
              <DataTableRow>
                <DataTableCell colSpan={table.headers.length}>
                  <Button onClick={() => raiseOnLoadMore()}>Load More</Button>
                </DataTableCell>
              </DataTableRow>
            </DataTableHead>
          )}
        </DataTableContent>
      </DataTable>
    );
  }
);

function getColumnValue(
  table: Table,
  row: { pkId: string; value: any },
  key: string,
  colIndex: number
) {
  if (colIndex === 0) {
    return (
      <DataTableCell key={key}>
        <Typography use="body2" className="NodeTabularDisplay__key">
          {row.pkId}
        </Typography>
      </DataTableCell>
    );
  }

  const value =
    table.type === TableType.KeyValue || table.type === TableType.Array
      ? row.value
      : row.value[key];

  switch (typeof value) {
    case 'undefined':
      return <DataTableCell className="undef" key={key} />;
    case 'object':
      return (
        <DataTableCell className="object" key={key}>
          <Typography use="body2">{'{ ... }'}</Typography>
        </DataTableCell>
      );
    default:
      return (
        <DataTableCell className={typeof value} key={key}>
          <ValueDisplay value={value} use="body2" />
        </DataTableCell>
      );
  }
}

async function buildTable(
  realtimeRef: firebase.database.Reference,
  limit: number
): Promise<Table> {
  const snap = await realtimeRef.once('value');
  const data = snap.val();

  // empty filter results
  if (data === undefined || data === null) {
    return {
      type: TableType.KeyValue,
      headers: ['No Data Available'],
      rows: [{ pkId: 'value is undefined', value: 'Value is undefined' }],
    };
  }

  const entries = Object.entries(data).slice(0, limit);
  const type = getTableType(entries);

  return {
    type,
    headers: getHeaders(type, entries),
    rows: entries.map(([key, value]) => ({ pkId: key, value })),
  };
}

function getTableType(entries: [string, unknown][]) {
  const [key, value] = entries[0];

  if (!isNaN(parseInt(key))) {
    return TableType.Array;
  } else if (typeof value === 'object') {
    return TableType.KeyObject;
  } else {
    return TableType.KeyValue;
  }
}

function getHeaders(type: TableType, entries: [string, any][]) {
  const [, value] = entries[0];
  switch (type) {
    case TableType.KeyValue:
      return ['key', 'value'];
    case TableType.Array:
      return ['', 'value'];
    default:
      return ['key', ...Object.keys(value)];
  }
}

export function isArrayLike(childKeys: string[]) {
  if (childKeys.length <= 1) {
    return false;
  }

  const halfOfList = childKeys.slice(0, DEFAULT_PAGE_SIZE * 2).sort();

  const isArrayIndex = (v: string, i: number) => v === i.toString();
  const isPushId = (v: string) => v.length === 20 && v[0] === '-';

  return halfOfList.every(isPushId) || halfOfList.every(isArrayIndex);
}
