import { FirealertsType, alertConfiguration, generateCloudEventWithData } from "./EventConfigs";
import { Typography } from "@rmwc/typography";
import { GridCell, GridRow } from "@rmwc/grid";
import { Card } from "@rmwc/card";
import { Callout } from "../../common/Callout";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@rmwc/button";
import { useEmulatorConfig } from "../../common/EmulatorConfigProvider";
import FirealertsLog from "./FirealertsLog";
import { useFirealerts } from "../api/useFirealerts";
import { FirealertsTrigger } from "../models";
import { Select } from "@rmwc/select";
import { ZeroState } from "./ZeroState";

import styles from "./FirealertsForm.module.scss";
import _ from "lodash";
import { IconButton } from "@rmwc/icon-button";

export const FirealertsForm = () => {
    const triggers = useFirealerts();
    const implementedAlerts = getAlertsForTriggers(triggers);
    const alertsList = Object.keys(implementedAlerts) as FirealertsType[];
    const config = useEmulatorConfig('eventarc');

    const [selectedAlert, setSelectedAlert] = useState(alertsList[0]);
    const [alertData, setAlertData] = useState(_.cloneDeep(alertConfiguration[selectedAlert]?.default));
    const [currentDefault, setCurrentDefault] = useState(_.cloneDeep(alertConfiguration[selectedAlert]?.default));

    useEffect(() => {
        setAlertData(_.cloneDeep(alertConfiguration[selectedAlert]?.default));
        setCurrentDefault(_.cloneDeep(alertConfiguration[selectedAlert]?.default));
    }, [selectedAlert]);

    const updateData = (key: string, value: any) => {
        key = key.slice(1);
        const newAlertData = { ...alertData };
        _.set(newAlertData, key, value);
        setAlertData(newAlertData);
    }

    const sendAlert = async () => {
        const event = generateCloudEventWithData(selectedAlert, alertData);
        const payload = { events: [event] }
        const url = `//${config.hostAndPort}/google/publishEvents`
        console.log("Posting event to: " + url);
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        console.log(res); // TODO(gburroughs): Add notification of success/error
    }

    const getTriggerName = (trigger: FirealertsTrigger): string => {
        const tokens = trigger.triggerName.split("-");
        return tokens[tokens.length - 2];
    }

    if (!triggers || triggers.length === 0) {
        return (
            <GridCell span={12}>
                <ZeroState />
            </GridCell>
        );
    }
    return (
        <>
            <GridCell span={12}>
                {!triggers || triggers.length === 0 ? <ZeroState /> :
                    <GridRow>
                        <GridCell span={12}>
                            <Typography use="headline6">Send Test {alertConfiguration[selectedAlert].name} Alert</Typography>
                        </GridCell>
                        <GridCell span={12}>
                            <Callout>For more information on what the fields mean see <a href={alertConfiguration[selectedAlert].link}>here</a></Callout>
                        </GridCell>
                        <GridCell span={12}>
                            <Card className={styles.container}>
                                <Select
                                    outlined
                                    label="Select Alert Type"
                                    defaultValue={selectedAlert}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedAlert(e.target.value as FirealertsType)}
                                >
                                    {alertsList.sort().map((alert) =>
                                        <option
                                            key={alert}
                                            value={alert}
                                            disabled={implementedAlerts[alert as FirealertsType]?.length === 0}
                                        >{alert}</option>
                                    )}
                                </Select>
                                <Typography use="body2" theme="textSecondaryOnBackground"> Triggers: {implementedAlerts[selectedAlert]?.map(getTriggerName).join(", ")}</Typography>
                                <form className={styles.eventForm}>
                                    <JSONForm
                                        alertData={alertData}
                                        parent={""}
                                        defaultObject={currentDefault}
                                        update={updateData}
                                    />
                                </form>
                                <GridRow>
                                    <GridCell span={2}>
                                        <Button label="Send Alert" unelevated icon="send" onClick={sendAlert} />
                                    </GridCell>
                                </GridRow>
                                <FirealertsLog />
                            </Card>
                        </GridCell>
                    </GridRow>
                }
            </GridCell>
        </>
    );
}


const isObject = (x: any) => typeof x === 'object' && !Array.isArray(x) && x !== null


const JSONForm = ({ alertData, parent, defaultObject, update }: { alertData: any, parent: string, defaultObject: any, update: (key: string, value: any) => void }) => {
    return <>
        {"{"}
        {Object.keys(alertData).map((key) => <div key={`${parent}.${key}`} className={styles.jsonBlock}>
            <label>{JSON.stringify(key)}: </label>
            {
                isObject(alertData[key]) ?
                    <JSONForm
                        alertData={alertData[key]}
                        parent={`${parent}.${key}`}
                        defaultObject={defaultObject}
                        update={update}
                    />
                    :
                    Array.isArray(alertData[key]) ?
                        <>
                            <br />
                            {"["}
                            <div className={styles.arrayBlock}>
                                {alertData[key].map((data: any, index: number) => <div key={`${parent}.${key}`}>

                                <IconButton style={{fontSize: "1em"}} label="delete" type="button" icon="delete" onClick={() => {
                                    alertData[key].splice(index, 1);
                                    update(`${parent}.${key}`, [...alertData[key]])
                                }} />
                                <JSONForm
                                    alertData={data}
                                    parent={`${parent}.${key}[${index}]`}
                                    defaultObject={defaultObject}
                                    update={update}
                                />
                                </div>
                                )}
                                <IconButton style={{fontSize: "1em"}} label="Add field" type="button" icon="add" onClick={(e) => {
                                    e.preventDefault();
                                    const defaultKey = `${parent}.${key}`.slice(1) + "[0]";
                                    const arrayValue = _.get(defaultObject, defaultKey);
                                    update(`${parent}.${key}`, [...alertData[key], arrayValue])
                                }} />
                            </div>
                            {"],"}
                        </>
                        :
                        <>
                            <input type="text" className={styles.fieldInput} value={alertData[key]} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                update(`${parent}.${key}`, e.target.value);
                            }} />
                        </>
            }
        </div>
        )}
        {"},"}
    </>
}

const getAlertsForTriggers = (triggers: FirealertsTrigger[]) => {
    if (!triggers || triggers.length === 0) return {};
    const alertTypes = Object.keys(alertConfiguration);
    const alertsForFunctions: { [key in FirealertsType]?: FirealertsTrigger[] } = {};
    alertTypes.forEach((alerttype) => {
        const alertTriggers = triggers.filter(t => t.eventTrigger.eventFilters.alerttype === alerttype);
        alertsForFunctions[alerttype as FirealertsType] = alertTriggers || [];
    });
    return alertsForFunctions;
}