import React, { Suspense, useEffect, useMemo, useState } from 'react';

import { useTemplate, useTemplateUpdater } from './api';

function RemoteConfig() {
  const { template, fetchNewTemplate } = useTemplate();
  const templateUpdater = useTemplateUpdater();

  async function updateTemplate() {
    // generate an updated template for testing
    const newTemplate = JSON.parse(JSON.stringify(template));
    newTemplate.parameters['welcome_message'].defaultValue.value =
      'I am a new template';

    try {
      await templateUpdater(newTemplate);
      fetchNewTemplate();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <button onClick={updateTemplate}>Update template</button>
      <pre>{JSON.stringify(template, null, 2)}</pre>
    </>
  );
}

export default function RemoteConfigWrapper() {
  return (
    <Suspense fallback={'loading...'}>
      <RemoteConfig />
    </Suspense>
  );
}
