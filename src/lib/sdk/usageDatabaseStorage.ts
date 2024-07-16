import { AppwriteException, DatabaseUsageRange, ProjectUsageRange, type Client, type Models, type Payload } from '@appwrite.io/console';

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
     * Aggregated total statistics of databases.
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
     * Aggregated total statistics of database storage.
     */
    databasesStorageTotal: number;
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
    /**
     * Aggregated total statistics of database storage per period.
     */
    databasesStorage: Metric[];
};

/**
 * Metric Breakdown
 */
type MetricBreakdown = {
    /**
     * Resource ID.
     */
    resourceId: string;
    /**
     * Resource name.
     */
    name: string;
    /**
     * The value of this metric at the timestamp.
     */
    value: number;
};

/**
 * UsageProject
 */
type UsageProject = {
    /**
     * Total aggregated number of function executions.
     */
    executionsTotal: number;
    /**
     * Total aggregated  number of documents.
     */
    documentsTotal: number;
    /**
     * Total aggregated number of databases.
     */
    databasesTotal: number;
    /**
     * Total aggregated sum of databases storage size (in bytes).
     */
    databasesStorageTotal: number;
    /**
     * Total aggregated number of users.
     */
    usersTotal: number;
    /**
     * Total aggregated sum of files storage size (in bytes).
     */
    filesStorageTotal: number;
    /**
     * Total aggregated number of buckets.
     */
    bucketsTotal: number;
    /**
     * Aggregated  number of requests per period.
     */
    requests: Metric[];
    /**
     * Aggregated number of consumed bandwidth per period.
     */
    network: Metric[];
    /**
     * Aggregated number of users per period.
     */
    users: Metric[];
    /**
     * Aggregated number of executions per period.
     */
    executions: Metric[];
    /**
     * Aggregated breakdown in totals of executions by functions.
     */
    executionsBreakdown: MetricBreakdown[];
    /**
     * Aggregated breakdown in totals of usage by buckets.
     */
    bucketsBreakdown: MetricBreakdown[];
    /**
     * Aggregated breakdown in totals of usage by databases.
     */
    databasesStorageBreakdown: MetricBreakdown[];
};

export class ProjectDBStorage {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    /**
     * Get project usage stats
     *
     *
     * @param {string} startDate
     * @param {string} endDate
     * @param {ProjectUsageRange} period
     * @throws {AppwriteException}
     * @returns {Promise}
    */
    async getUsage(startDate: string, endDate: string, period?: ProjectUsageRange): Promise<UsageProject> {
        if (typeof startDate === 'undefined') {
            throw new AppwriteException('Missing required parameter: "startDate"');
        }

        if (typeof endDate === 'undefined') {
            throw new AppwriteException('Missing required parameter: "endDate"');
        }

        const apiPath = '/project/usage';
        const payload: Payload = {};

        if (typeof startDate !== 'undefined') {
            payload['startDate'] = startDate;
        }

        if (typeof endDate !== 'undefined') {
            payload['endDate'] = endDate;
        }

        if (typeof period !== 'undefined') {
            payload['period'] = period;
        }

        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Get databases usage stats
     *
     *
     * @param {DatabaseUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise}
    */
    async getDBUsage(range?: DatabaseUsageRange): Promise<UsageDatabases> {
        const apiPath = '/databases/usage';
        const payload: Payload = {};

        if (typeof range !== 'undefined') {
            payload['range'] = range;
        }

        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
}