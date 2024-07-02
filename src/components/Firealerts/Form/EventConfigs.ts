
const crashlyticsIssueDefault = {
    "appVersion": "1 (1.0.0)",
    "id": "1",
    "subtitle": "_MyHomePageState._sendFeedback",
    "title": "MissingPluginException(No implementation found for method sendFeedback on channel app.example.firealerts/feedback)",
};

const crashlyticsFatalIssueDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsNewFatalIssuePayload",
    "issue": crashlyticsIssueDefault,
};

const crashlyticsNonFatalIssueDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsNewNonfatalIssuePayload",
    "issue": crashlyticsIssueDefault,
};

const crashlyticsRegressionDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsRegressionAlertPayload",
    "type": "fatal",
    "issue": crashlyticsIssueDefault,
    "resolveTime": new Date().toISOString(),
};

const trendingIssueDetailsDefault = {
    "type": "fatal",
    "issue": crashlyticsIssueDefault,
    "eventCount": 100,
    "userCount": 100,
}

const crashlyticsVelocityDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsVelocityAlertPayload",
    issue: crashlyticsIssueDefault,
    createTime: new Date().toISOString(),
    crashCount: 100,
    crashPercentage: 80,
    firstVersion: "1 (1.0.0)",
}

const crashlyticsStabilityDigestDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsStabilityDigestPayload",
    "digestDate": new Date().toISOString(),
    "trendingIssues": [trendingIssueDetailsDefault], // TODO(gburroughs): Add support for arrays in json form
};

const crashlyticsNewAnrIssueDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsNewAnrIssuePayload",
    "issue": crashlyticsIssueDefault,
};

const billingPlanUpdateDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.BillingPlanUpdatePayload", 
    billingPlan: "defaultBillingPlan", // TODO(gburorughs): what makes sense for a default here?
    principalEmail: "username@gmail.com",
    notificationType: "downgrade",
};

const billingPlanAutomatedUpdateDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.BillingPlanAutomatedUpdatePayload",
    billingPlan: "defaultBillingPlan",
    notificationType: "downgrade",
};

const appDistributionNewTesterIosDeviceDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.AppDistroNewTesterIosDevicePayload",
    testerName: '',
    testerEmail: '',
    testerDeviceModelName: '',
    testerDeviceIdentifier: '',
};
const appDistributionInAppFeedbackDefault: { [key: string]: any } = {
    "@type": "type.googleapis.com/google.events.firebase.firebasealerts.v1.AppDistroInAppFeedbackPayload",
    feedbackReport: '',
    feedbackConsoleUri: '',
    testerName: '',
    testerEmail: '',
    appVersion: '',
    text: '',
    screenshotUri: '',
};


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


// TODO(gburroughs): See how we can infer most of this data from project
export const generateCloudEventWithData = (alerttype: string, data: any) => {
    return {
        "alerttype": alerttype,
        "id": "196160485589818220",
        "source": "//firebasealerts.googleapis.com/projects/558234855466",
        "specVersion": "1.0",
        "appid": "1:558234855466:android:ba42cada6c7900f5b83b53",
        "time": new Date().toISOString(),
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
| "crashlytics.newFatalIssue"
| "crashlytics.newNonfatalIssue"
| "crashlytics.regression"
| "crashlytics.stabilityDigest"
| "crashlytics.velocity"
| "crashlytics.newAnrIssue"
| "billing.planUpdate"
| "billing.planAutomatedUpdate"
| "appDistribution.newTesterIosDevice"
| "appDistribution.inAppFeedback"
| "performance.threshold";

export type AlertConfig = {
    [key in FirealertsType]: {
        name: string,
        default: { [key: string]: any },
        link: string
    };
};
export const alertConfiguration: AlertConfig = {
    "crashlytics.newFatalIssue": {
        name: "Crashlytics: New Fatal Issue",
        default: crashlyticsFatalIssueDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.newfatalissuepayload",
    }, 
    "crashlytics.newNonfatalIssue": {
        name: "Crashlytics: New Non-Fatal Issue",
        default: crashlyticsNonFatalIssueDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.newnonfatalissuepayload",
    },
    "crashlytics.regression": {
        name: "Crashlytics: Regression", 
        default: crashlyticsRegressionDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.regressionalertpayload",
    },
    "crashlytics.stabilityDigest": {
        name: "Crashlytics: Stablity Digest", 
        default: crashlyticsStabilityDigestDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.stabilitydigestpayload",
    },
    "crashlytics.velocity": {
        name: "Crashlytics: Velocity", 
        default: crashlyticsVelocityDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.velocityalertpayload",
    },
    "crashlytics.newAnrIssue": {
        name: "Crahslytics: New ANR Issue",
        default: crashlyticsNewAnrIssueDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.newanrissuepayload",
    },
    "billing.planUpdate": {
        name: "Billing: Plan Update",
        default: billingPlanUpdateDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.billing.planupdatepayload",
    },
    "billing.planAutomatedUpdate": {
        name: "Billing: Plan Automated Update",
        default: billingPlanAutomatedUpdateDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.billing.planautomatedupdatepayload",
    },
    "appDistribution.newTesterIosDevice": {
        name: "App Distribution: New Tester IOS Device",
        default: appDistributionNewTesterIosDeviceDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.appdistribution.newtesterdevicepayload",
    },
    "appDistribution.inAppFeedback": {
        name: "App Distribution: In App Feedback",
        default: appDistributionInAppFeedbackDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.appdistribution.inappfeedbackpayload",
    },
    "performance.threshold": {
        name: "Performance Threshold",
        default: performanceThresholdDefault,
        link: "https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.performance.thresholdalertpayload",
    },
};