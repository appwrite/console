import {
    AppwriteException,
    FunctionUsageRange,
    type Client,
    type Payload,
    type ProjectUsageRange
} from '@appwrite.io/console';

/**
 * Metric
 */
type Metric = {
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
     * Total aggregated number of users.
     */
    usersTotal: number;
    /**
     * Total aggregated sum of files storage size (in bytes).
     */
    filesStorageTotal: number;
    /**
     * Total aggregated sum of functions storage size (in bytes).
     */
    functionsStorageTotal: number;
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
     * Aggregated breakdown in totals of usage by functions.
     */
    functionsStorageBreakdown: MetricBreakdown[];
};

/**
 * UsageFunction
 */
export type UsageFunction = {
    /**
     * The time range of the usage stats.
     */
    range: string;
    /**
     * Total aggregated number of function deployments.
     */
    deploymentsTotal: number;
    /**
     * Total aggregated sum of function deployments storage.
     */
    deploymentsStorageTotal: number;
    /**
     * Total aggregated number of function builds.
     */
    buildsTotal: number;
    /**
     * total aggregated sum of function builds storage.
     */
    buildsStorageTotal: number;
    /**
     * Total aggregated sum of function builds compute time.
     */
    buildsTimeTotal: number;
    /**
     * Total  aggregated number of function executions.
     */
    executionsTotal: number;
    /**
     * Total aggregated sum of function  executions compute time.
     */
    executionsTimeTotal: number;
    /**
     * Aggregated number of function deployments per period.
     */
    deployments: Metric[];
    /**
     * Aggregated number of  function deployments storage per period.
     */
    deploymentsStorage: Metric[];
    /**
     * Aggregated number of function builds per period.
     */
    builds: Metric[];
    /**
     * Aggregated sum of function builds storage per period.
     */
    buildsStorage: Metric[];
    /**
     * Aggregated sum of function builds compute time per period.
     */
    buildsTime: Metric[];
    /**
     * Aggregated number of function executions per period.
     */
    executions: Metric[];
    /**
     * Aggregated number of function executions compute time per period.
     */
    executionsTime: Metric[];
};

export class TempFunctions {
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
    async getUsage(
        startDate: string,
        endDate: string,
        period?: ProjectUsageRange
    ): Promise<UsageProject> {
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
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            payload
        );
    }

    /**
     * Get function usage
     *
     *
     * @param {string} functionId
     * @param {FunctionUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise}
     */
    async getFunctionUsage(functionId: string, range?: FunctionUsageRange): Promise<UsageFunction> {
        if (typeof functionId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "functionId"');
        }

        const apiPath = '/functions/{functionId}/usage'.replace('{functionId}', functionId);
        const payload: Payload = {};

        if (typeof range !== 'undefined') {
            payload['range'] = range;
        }

        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            payload
        );
    }
}
