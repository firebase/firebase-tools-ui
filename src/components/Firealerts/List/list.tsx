import { GridCell, GridRow } from '@rmwc/grid';
import React from 'react';
import { useFirealerts } from '../api/useFirealerts';

import { FirealertsTrigger } from '../models';
import { FirealertsType, alertConfiguration } from '../Form/EventConfigs';
import { FirealertsForm } from '../Form/FirealertsForm';
import { ZeroState } from '../Form/ZeroState';

export const FirealertsList: React.FC<React.PropsWithChildren> = () => {
  const triggers = useFirealerts();
  const implementedAlerts = getAlertsForTriggers(triggers);
  const alertsList = Object.keys(implementedAlerts) as FirealertsType[];
  const [selectedAlert, setSelectedAlert] = React.useState<FirealertsType>(alertsList[0]);
  
  const currentParams = new URLSearchParams(window.location.search);
  const hasSearchParams = currentParams.has('q');
  if (!hasSearchParams) {
    currentParams.set('q', 'metadata.emulator.name%3D"functions"');
  }


  return (
    // <GridCell span={12} className="Scheduled">
    //   <Elevation z="2" wrap>
    //     <Card>
    //       {triggers ? (
    //         <FirealertsTable functions={triggers} />
    //       ) : (
    //         <ZeroState></ZeroState>
    //       )}
    //     </Card>
    //   </Elevation>
    // </GridCell>
    <>
    <GridCell span={12}>
      {alertsList ? <>
        <FirealertsForm />
        <GridRow />
      </>:
        <ZeroState />
      }
    </GridCell>
    </>
  );
};


const getAlertsForTriggers = (triggers: FirealertsTrigger[]) => {
  const alertTypes = Object.keys(alertConfiguration);
  const alertsForFunctions: {[key in FirealertsType]?: FirealertsTrigger[]} = {};
  alertTypes.forEach((alerttype) => {
    const alertTriggers = triggers.filter(t => t.eventTrigger.eventFilters.alerttype === alerttype);
    alertsForFunctions[alerttype as FirealertsType] = alertTriggers;
  })
  return alertsForFunctions;
}