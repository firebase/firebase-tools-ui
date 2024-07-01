export interface FirealertsTrigger {
    projectId: string;
    triggerName: string;
    eventTrigger: EventTrigger;
}

export interface EventTrigger {
    eventFilters:  {
        alerttype?: string;
    };
    eventType: string;
    service: string;
}