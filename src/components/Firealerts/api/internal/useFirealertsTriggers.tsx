// import useSwr from 'swr';

import useSWR from 'swr';
import { useEmulatorConfig } from '../../../common/EmulatorConfigProvider';
import { FirealertsTrigger } from '../../models';

export function useFirealertsTriggers(): FirealertsTrigger[] { 
    const config = useEmulatorConfig('eventarc');
    const FIREALERTS_EVENT_TYPE = "google.firebase.firebasealerts.alerts.v1.published-google";
    const fetcher = async (url: URL) => {
        console.log(`Fetching FireAlerts triggers from ${url}`);
        const response = await fetch(url);
        const json = await response.json();
        return json; 
    }

    const { data } = useSWR(`//${config.hostAndPort}/google/getTriggers`, fetcher, {suspense: true});
    return data[FIREALERTS_EVENT_TYPE];
}