import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import React, { Suspense, useEffect, useMemo, useState } from 'react';

import { useTemplate, useTemplateUpdater } from './api';

function RemoteConfig() {
  const { template, fetchNewTemplate } = useTemplate();
  const templateUpdater = useTemplateUpdater();

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