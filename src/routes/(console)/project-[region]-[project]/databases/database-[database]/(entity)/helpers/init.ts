import type { Page } from '@sveltejs/kit';
import { getContext, setContext } from 'svelte';
import {
    type AnalyticsResult,
    type DatabaseSdkResult,
    type DependenciesResult,
    type TerminologyResult,
    useAnalytics,
    useDependencies,
    useTerminology,
    useDatabasesSdk
} from '$database/(entity)';

const TERMINOLOGIES_KEY = Symbol('terminologies');

export type Terminologies = {
    analytics: AnalyticsResult;
    terminology: TerminologyResult;
    dependencies: DependenciesResult;
    databaseSdk: DatabaseSdkResult;
};

export function getTerminologies(): Terminologies {
    return getContext<Terminologies>(TERMINOLOGIES_KEY);
}

export function setTerminologies(page: Page) {
    setContext(TERMINOLOGIES_KEY, buildTerminologies(page));
}

function buildTerminologies(page: Page) {
    const terminology = useTerminology(page);
    return {
        terminology,
        analytics: useAnalytics(terminology),
        dependencies: useDependencies(terminology),
        databaseSdk: useDatabasesSdk(page, terminology)
    };
}
