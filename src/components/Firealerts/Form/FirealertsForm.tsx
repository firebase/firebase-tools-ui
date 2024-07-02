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

export const FirealertsForm = () => {
    const triggers = useFirealerts();
    const implementedAlerts = getAlertsForTriggers(triggers);
    const alertsList = Object.keys(implementedAlerts) as FirealertsType[];
    const config = useEmulatorConfig('eventarc');

    const [selectedAlert, setSelectedAlert] = useState(alertsList[0]);
    const [alertData, setAlertData] = useState(alertConfiguration[selectedAlert]?.default);

    useEffect(() => {
        setAlertData(alertConfiguration[selectedAlert]?.default);
    }, [selectedAlert]);

    const updateData = (key: string, value: any) => {
        key = key.slice(1);
        const newAlertData = { ...alertData };
        // updateFromStringPath(newAlertData, key, value);
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
                                            value={alert}
                                            disabled={implementedAlerts[alert as FirealertsType]?.length === 0}
                                        >{alert}</option>
                                    )}
                                </Select>
                                <Typography use="body2" theme="textSecondaryOnBackground"> Triggers: {implementedAlerts[selectedAlert]?.map(getTriggerName).join(", ")}</Typography>
                                <form className={styles.eventForm}>
                                    {createJSONForm(alertData, 1, "", updateData)}
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

const createIndent = (indentLevel: number) =>
    new Array(indentLevel).fill(1).map(() => <span className={styles.tab}></span>);

const createJSONForm = (alertData: any, indentLevel: number, parent: string, update: any) => {
    return <>
        {"{"}
        {Object.keys(alertData).map((key) => <div key={key}>
            {createIndent(indentLevel)}
            <label>{JSON.stringify(key)}: </label>
            {
                isObject(alertData[key]) ?
                    createJSONForm(alertData[key], indentLevel + 1, `${parent}.${key}`, update) :
                    <><input type="text" value={alertData[key]} onChange={(e) => {
                        update(`${parent}.${key}`, e.target.value);
                    }}></input></>
            }
        </div>
        )}
        {createIndent(indentLevel - 1)}
        {"}"}
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
    console.log(alertsForFunctions);
    return alertsForFunctions;
}