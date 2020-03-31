import { useLocalStorage, writeStorage } from '@rehooks/local-storage';
import { Button } from '@rmwc/button';
import { GridCell } from '@rmwc/grid';
import React from 'react';

import { Callout } from '../common/Callout';
import { CONSOLE_ROOT } from '../common/constants';

const DISMISS_KEY = 'isLocalWarningCalloutDismissed';

export const LocalWarningCallout: React.FC<{
  projectId: string;
}> = ({ projectId }) => {
  const [isDismissed] = useLocalStorage<boolean>(DISMISS_KEY);

  if (isDismissed) {
    return null;
  }

  return (
    <GridCell span={12}>
      <Callout
        type="note"
        actions={
          <>
            <Button
              tag="a"
              href={`${CONSOLE_ROOT}/project/${projectId}/overview`}
              target="_blank"
              label="View project"
            />
            <Button
              label="Dismiss"
              onClick={() => writeStorage(DISMISS_KEY, true)}
            />
          </>
        }
      >
        Remember this is a local environment. Visit the production version of{' '}
        <strong>{projectId}</strong> in the console.
      </Callout>
    </GridCell>
  );
};
