/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const crashlyticsIssueDefault = {
  appVersion: '1 (1.0.0)',
  id: '1',
  title: 'TestApp.main',
  subtitle: 'Runtime Error',
};

const crashlyticsFatalIssueDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsNewFatalIssuePayload',
  issue: crashlyticsIssueDefault,
};

const crashlyticsNonFatalIssueDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsNewNonfatalIssuePayload',
  issue: crashlyticsIssueDefault,
};

const crashlyticsRegressionDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsRegressionAlertPayload',
  type: 'fatal',
  issue: crashlyticsIssueDefault,
  resolveTime: new Date().toISOString(),
};

const trendingIssueDetailsDefault = {
  type: 'fatal',
  issue: crashlyticsIssueDefault,
  eventCount: 100,
  userCount: 100,
};

const crashlyticsVelocityDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsVelocityAlertPayload',
  issue: crashlyticsIssueDefault,
  createTime: new Date().toISOString(),
  crashCount: 100,
  crashPercentage: 80,
  firstVersion: '1 (1.0.0)',
};

const crashlyticsStabilityDigestDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsStabilityDigestPayload',
  digestDate: new Date().toISOString(),
  trendingIssues: [trendingIssueDetailsDefault],
};

const crashlyticsNewAnrIssueDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.CrashlyticsNewAnrIssuePayload',
  issue: crashlyticsIssueDefault,
};

const billingPlanUpdateDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.BillingPlanUpdatePayload',
  billingPlan: 'defaultBillingPlan',
  principalEmail: 'username@gmail.com',
  notificationType: 'downgrade',
};

const billingPlanAutomatedUpdateDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.BillingPlanAutomatedUpdatePayload',
  billingPlan: 'defaultBillingPlan',
  notificationType: 'downgrade',
};

const appDistributionNewTesterIosDeviceDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.AppDistroNewTesterIosDevicePayload',
  testerName: 'Test User',
  testerEmail: 'username@gmail.com',
  testerDeviceModelName: 'Google Pixel 10',
  testerDeviceIdentifier: '12345',
};
const appDistributionInAppFeedbackDefault: { [key: string]: any } = {
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.AppDistroInAppFeedbackPayload',
  feedbackReport: '',
  feedbackConsoleUri: '',
  testerName: 'Test User',
  testerEmail: 'username@gmail.com',
  appVersion: '1 (1.0.0)',
  text: '',
  screenshotUri: '',
};

const performanceThresholdDefault: { [key: string]: any } = {
  metricType: 'duration',
  appVersion: '1 (1.0.0)',
  violationValue: 0.205629,
  thresholdUnit: 'seconds',
  violationUnit: 'seconds',
  '@type':
    'type.googleapis.com/google.events.firebase.firebasealerts.v1.FireperfThresholdAlertPayload',
  numSamples: '200',
  eventName: 'custom-trace',
  thresholdValue: 0.15,
  eventType: 'duration_trace',
  conditionPercentile: 90,
  investigateUri: '',
};

export const generateCloudEventWithData = (alerttype: string, data: any) => {
  const projectId = '1234567890';
  return {
    alerttype: alerttype,
    id: Math.random().toString().slice(2),
    source: `//firebasealerts.googleapis.com/projects/${projectId}`,
    specVersion: '1.0',
    appid: `1:${projectId}:web:${crypto
      .getRandomValues(new Uint8Array(16))
      .reduce((acc, byte) => acc + `${byte.toString(16)}`, '')}`,
    time: new Date().toISOString(),
    type: 'google.firebase.firebasealerts.alerts.v1.published',
    project: projectId,
    data: {
      '@type':
        'type.googleapis.com/google.events.firebase.firebasealerts.v1.AlertData',
      createTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      payload: data,
    },
  };
};

export type FirealertsType =
  | 'crashlytics.newFatalIssue'
  | 'crashlytics.newNonfatalIssue'
  | 'crashlytics.regression'
  | 'crashlytics.stabilityDigest'
  | 'crashlytics.velocity'
  | 'crashlytics.newAnrIssue'
  | 'billing.planUpdate'
  | 'billing.planAutomatedUpdate'
  | 'appDistribution.newTesterIosDevice'
  | 'appDistribution.inAppFeedback'
  | 'performance.threshold';

export type AlertConfig = {
  [key in FirealertsType]: {
    name: string;
    default: { [key: string]: any };
    link: string;
  };
};
export const alertConfiguration: AlertConfig = {
  'crashlytics.newFatalIssue': {
    name: 'Crashlytics: New Fatal Issue',
    default: crashlyticsFatalIssueDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.newfatalissuepayload',
  },
  'crashlytics.newNonfatalIssue': {
    name: 'Crashlytics: New Non-Fatal Issue',
    default: crashlyticsNonFatalIssueDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.newnonfatalissuepayload',
  },
  'crashlytics.regression': {
    name: 'Crashlytics: Regression',
    default: crashlyticsRegressionDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.regressionalertpayload',
  },
  'crashlytics.stabilityDigest': {
    name: 'Crashlytics: Stablity Digest',
    default: crashlyticsStabilityDigestDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.stabilitydigestpayload',
  },
  'crashlytics.velocity': {
    name: 'Crashlytics: Velocity',
    default: crashlyticsVelocityDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.velocityalertpayload',
  },
  'crashlytics.newAnrIssue': {
    name: 'Crahslytics: New ANR Issue',
    default: crashlyticsNewAnrIssueDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.crashlytics.newanrissuepayload',
  },
  'billing.planUpdate': {
    name: 'Billing: Plan Update',
    default: billingPlanUpdateDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.billing.planupdatepayload',
  },
  'billing.planAutomatedUpdate': {
    name: 'Billing: Plan Automated Update',
    default: billingPlanAutomatedUpdateDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.billing.planautomatedupdatepayload',
  },
  'appDistribution.newTesterIosDevice': {
    name: 'App Distribution: New Tester IOS Device',
    default: appDistributionNewTesterIosDeviceDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.appdistribution.newtesterdevicepayload',
  },
  'appDistribution.inAppFeedback': {
    name: 'App Distribution: In App Feedback',
    default: appDistributionInAppFeedbackDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.appdistribution.inappfeedbackpayload',
  },
  'performance.threshold': {
    name: 'Performance Threshold',
    default: performanceThresholdDefault,
    link: 'https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.alerts.performance.thresholdalertpayload',
  },
};
