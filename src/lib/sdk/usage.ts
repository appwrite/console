import type { Models } from '@appwrite.io/console';

export function accumulateUsage(usage: Models.Metric[], base: number): Models.Metric[] {
    const accumulation = usage.reduce(
        (carry, item) => {
            const value = item.value + carry.currentTotal;
            return {
                currentTotal: value,
                metrics: [...carry.metrics, { ...item, value }]
            };
        },
        {
            currentTotal: base,
            metrics: []
        }
    );

    return accumulation.metrics;
}

export type Metric = {
    /**
     * The value of this metric at the timestamp.
     */
    value: number;
    /**
     * The date at which this metric was aggregated in ISO 8601 format.
     */
    date: string;
};
/**
 * UsageDatabases
 */
export type UsageDatabases = {
    /**
     * The time range of the usage stats.
     */
    range: string;
    /**
     * Aggregated total statistics of documents.
     */
    databasesTotal: number;
    /**
     * Aggregated total statistics of collections.
     */
    collectionsTotal: number;
    /**
     * Aggregated total statistics of documents.
     */
    documentsTotal: number;
    /**
     * Aggregated total statistics of documents per period.
     */
    databases: Metric[];
    /**
     * Aggregated total statistics  of collections per period.
     */
    collections: Metric[];
    /**
     * Aggregated total statistics  of documents per period.
     */
    documents: Metric[];
};
/**
 * UsageDatabase
 */
export type UsageDatabase = {
    /**
     * The time range of the usage stats.
     */
    range: string;
    /**
     * Aggregated total statistics of collections.
     */
    collectionsTotal: number;
    /**
     * Aggregated total statistics of documents.
     */
    documentsTotal: number;
    /**
     * Aggregated  statistics collections per period.
     */
    collections: Metric[];
    /**
     * Aggregated  statistics of documents per period.
     */
    documents: Metric[];
};
/**
 * UsageCollection
 */
export type UsageCollection = {
    /**
     * The time range of the usage stats.
     */
    range: string;
    /**
     * Aggregated total statistics of documents.
     */
    documentsTotal: number;
    /**
     * Aggregated statistics  of documents per period.
     */
    documents: Metric[];
};
/**
 * UsageUsers
 */
export type UsageUsers = {
    /**
     * The time range of the usage stats.
     */
    range: string;
    /**
     * Aggregated total statistics of users.
     */
    usersTotal: number;
    /**
     * Aggregated total statistics sessions created.
     */
    sessionsTotal: number;
    /**
     * Aggregated statistics of users per period.
     */
    users: Metric[];
    /**
     * Aggregated statistics sessions created per period.
     */
    sessions: Metric[];
};
/**
 * StorageUsage
 */
export type UsageStorage = {
    /**
     * The time range of the usage stats.
     */
    range: string;
    /**
     * Aggregated total statistics of buckets
     */
    bucketsTotal: number;
    /**
     * Aggregated total statistics of files.
     */
    filesTotal: number;
    /**
     * Aggregated total statistics  of files storage (in bytes).
     */
    filesStorageTotal: number;
    /**
     * Aggregated statistics of buckets per period.
     */
    buckets: Metric[];
    /**
     * Aggregated statistics of files per period.
     */
    files: Metric[];
    /**
     * Aggregated statistics of storage (in bytes) per period .
     */
    storage: Metric[];
};
/**
 * UsageBuckets
 */
export type UsageBuckets = {
    /**
     * The time range of the usage stats.
     */
    range: string;
    /**
     * Aggregated total statistics of bucket files.
     */
    filesTotal: number;
    /**
     * Aggregated total statistics of bucket files storage.
     */
    filesStorageTotal: number;
    /**
     * Aggregated  statistics of bucket files per period.
     */
    files: Metric[];
    /**
     * Aggregated statistics of bucket storage files per period.
     */
    storage: Metric[];
    /**
     * Aggregated statistics of bucket image transformations per period.
     */
    imageTransformations: Metric[];
    /**
     * Total aggregated number of bucket image transformations.
     */
    imageTransformationsTotal: number;
};
/**
 * UsageFunctions
 */
export type UsageFunctions = {
    /**
     * The time range of the usage stats.
     */
    range: string;
    /**
     * Aggregated total statistics of functions.
     */
    functionsTotal: number;
    /**
     * Aggregated total statistics of function deployments.
     */
    deploymentsTotal: number;
    /**
     * Aggregated total statistics of function deployments storage.
     */
    deploymentsStorageTotal: number;
    /**
     * Aggregated total statistics of function builds.
     */
    buildsTotal: number;
    /**
     * Aggregated total statistics of builds storage.
     */
    buildsStorageTotal: number;
    /**
     * Aggregated total statistics of build compute time.
     */
    buildsTimeTotal: number;
    /**
     * Aggregated total statistics of functions executions.
     */
    executionsTotal: number;
    /**
     * Aggregated total statistics of functions execution compute time.
     */
    executionsTimeTotal: number;
    /**
     * Aggregated statistics of functions per period.
     */
    functions: Metric[];
    /**
     * Aggregated statistics of deployments per period.
     */
    deployments: Metric[];
    /**
     * Aggregated statistics of deployments storage per period.
     */
    deploymentsStorage: Metric[];
    /**
     * Aggregated statistics of builds per period.
     */
    builds: Metric[];
    /**
     * Aggregated statistics of storage per period.
     */
    buildsStorage: Metric[];
    /**
     * Aggregated statistics of  builds compute time per period.
     */
    buildsTime: Metric[];
    /**
     * Aggregated statistics of  executions per period.
     */
    executions: Metric[];
    /**
     * Aggregated statistics of execution compute time per period.
     */
    executionsTime: Metric[];
};
/**
 * UsageProject
 */
export type UsageProject = {
    /**
     * The time range of the usage stats.
     */
    range: number;
    /**
     * Aggregated statistics of number of requests per period.
     */
    requests: string[];
    /**
     * Aggregated statistics of consumed bandwidth per period.
     */
    network: string[];
    /**
     * Aggregated statistics of total function executions.
     */
    executionsTotal: number;
    /**
     * Aggregated statistics of total number of documents.
     */
    documentsTotal: number;
    /**
     * Aggregated statistics of total number of databases.
     */
    databasesTotal: number;
    /**
     * Aggregated statistics of total number of users.
     */
    usersTotal: number;
    /**
     * Aggregated statistics of total occupied storage size (in bytes).
     */
    filesStorageTotal: number;
    /**
     * Aggregated statistics of total number of buckets.
     */
    bucketsTotal: number;

    /**
     * Aggregated statistics of total number of SMS sent.
     */
    authPhoneTotal: number;

    /**
     * Aggregated statistics of estimated SMS cost.
     */
    authPhoneEstimate: number;

    /**
     * Aggregated statistics of total number SMS by country.
     */
    authPhoneCountriesBreakdown: Models.MetricBreakdown[];

    /**
     * Array of image transformations per period.
     */
    imageTransformations: Metric[];

    /**
     * Aggregated statistics of total number of image transformations.
     */
    imageTransformationsTotal: number;
};
