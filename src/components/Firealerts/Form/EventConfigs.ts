const performanceThresholdDefault: { [key: string]: any } = {
    "metricType": "duration",
    "appVersion": "1 (1.0.0)",
    "violationValue": 0.205629,
    "thresholdUnit": "seconds",
    "violationUnit": "seconds",
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.FireperfThresholdAlertPayload",
    "numSamples": "200",
    "eventName": "custom-trace-3",
    "thresholdValue": 0.15,
    "eventType": "duration_trace",
    "conditionPercentile": 90,
    "investigateUri": "https://console.firebase.google.com/project/gburroughs-test/performance/app/android:com.example.alerts/troubleshooting/trace/DURATION_TRACE/custom-trace-3/duration/duration?utm_source=fireperf_threshold_alerts&utm_medium=eventarc&percentile=90"
};


const crashlyticsFatalIssueDefault: { [key: string]: any } = {
    "@type": "",
    "issue": {
        "appVersion": "1 (1.0.0)",
        "id": "1",
        "subtitle": "_MyHomePageState._sendFeedback",
        "title": "MissingPluginException(No implementation found for method sendFeedback on channel app.example.firealerts/feedback)",
    }
};



// TODO(gburroughs): See how we can infer most of this data from project
export const generateCloudEventWithData = (alerttype: string, data: any) => {
    return {
        "alerttype": alerttype, 
        "id": "196160485589818220",
        "source": "//firebasealerts.googleapis.com/projects/558234855466",
        "specVersion": "1.0",
        "appid": "1:558234855466:android:ba42cada6c7900f5b83b53",
        "time":new Date().toISOString(),
        "type": "google.firebase.firebasealerts.alerts.v1.published",
        "project": "558234855466",
        "data": {
            "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.AlertData",
            "createTime": new Date().toISOString(),
            "endTime": new Date().toISOString(),
            "payload": data
        }
    }
}

export type FirealertsType = 
    "performance.threshold" | 
    "crashlytics.newFatalIssue";

export type AlertConfig = {
    [key in FirealertsType]: {
        name: string, 
        default: { [key: string]: any }, 
        link: string
    };
};
export const alertConfiguration: {[key: string]: { name: string, default: any, link: string}} = {
    "performance.threshold": {
        name: "Performance Threshold",
        default: performanceThresholdDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.performance.thresholdalertpayload",
    },
    "crashlytics.newFatalIssue": {
        name: "New Fatal Issue",
        default: crashlyticsFatalIssueDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.newfatalissuepayload",
    }
};