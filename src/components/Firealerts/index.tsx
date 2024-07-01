import React, { Suspense } from "react";
import { useFirealertsTriggers } from "./api/internal/useFirealertsTriggers";
import { EmulatorDisabled } from "../common/EmulatorDisabled";
import { Spinner } from "../common/Spinner";
import { useIsEmulatorDisabled } from "../common/EmulatorConfigProvider";
import { FirealertsProvider } from "./api/useFirealerts";
import { Switch } from "react-router";
import { Route } from "react-router-dom";
import { FirealertsForm } from "./Form/FirealertsForm";

export const FirealertsRoute: React.FC = () => {
  return (<Suspense fallback={<FirealertsRouteSuspended />}>
    <HydrateFirealerts>
      <Switch>
        <Route path="/firealerts">
          <FirealertsForm />
        </Route>
      </Switch>
    </HydrateFirealerts>
  </Suspense>
  );
};


const HydrateFirealerts: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const functions = useFirealertsTriggers();
  return (
    <FirealertsProvider triggers={functions}>{children}</FirealertsProvider>
  )
};
const FirealertsRouteSuspended: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const isDisabled = useIsEmulatorDisabled('eventarc');
  return isDisabled ? (
    <EmulatorDisabled productName="FireAlerts" />
  ) : (
    <Spinner span={12} message="FireAlerts Emulator Loading..." />
  );
};

export default FirealertsRoute;