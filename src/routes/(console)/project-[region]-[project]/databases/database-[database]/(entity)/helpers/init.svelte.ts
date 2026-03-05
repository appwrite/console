import { page } from '$app/state';
import {
    type AnalyticsResult,
    type DatabaseSdkResult,
    type DependenciesResult,
    type TerminologyResult,
    useAnalytics,
    useDependencies,
    useTerminology,
    useDatabaseSdk
} from '$database/(entity)';

export type Terminologies = {
    analytics: AnalyticsResult;
    terminology: TerminologyResult;
    dependencies: DependenciesResult;
    databaseSdk: DatabaseSdkResult;
};

const terminologies = $derived.by((): Terminologies => {
    const terminology = useTerminology(page);
    return {
        terminology,
        analytics: useAnalytics(terminology),
        dependencies: useDependencies(terminology),
        databaseSdk: useDatabaseSdk(page, terminology)
    };
});

export function getTerminologies(): Terminologies {
    return terminologies;
}
