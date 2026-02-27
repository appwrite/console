import { writable } from 'svelte/store';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { Models } from '@appwrite.io/console';

export type JsonExportStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export type JsonExportJob = {
    status: JsonExportStatus;
    tableName: string;
    filename: string;
    fetchedRows: number;
    totalRows: number;
    error?: string;

    // Config
    region: string;
    project: string;
    databaseId: string;
    tableId: string;
    columns: string[];
    queries: string[];
    wildcardQueries: string[];
    prettyPrint: boolean;
};

export type JsonExportConfig = {
    region: string;
    project: string;
    databaseId: string;
    tableId: string;
    tableName: string;
    filename: string;
    columns: string[];
    queries: string[];
    wildcardQueries: string[];
    prettyPrint: boolean;
};

function createJsonExportStore() {
    const { subscribe, set, update } = writable<Map<string, JsonExportJob>>(new Map());

    async function startExport(config: JsonExportConfig) {
        const jobId = `${config.databaseId}:${config.tableId}:${Date.now()}`;

        const job: JsonExportJob = {
            status: 'pending',
            tableName: config.tableName,
            filename: config.filename,
            fetchedRows: 0,
            totalRows: 0,
            region: config.region,
            project: config.project,
            databaseId: config.databaseId,
            tableId: config.tableId,
            columns: config.columns,
            queries: config.queries,
            wildcardQueries: config.wildcardQueries,
            prettyPrint: config.prettyPrint
        };

        update((jobs) => {
            jobs.set(jobId, job);
            return new Map(jobs);
        });

        // Run the export in the background
        runExport(jobId, config);
    }

    async function runExport(jobId: string, config: JsonExportConfig) {
        const PAGE_SIZE = 100;
        const MAX_ROWS = 5000;
        let offset = 0;
        let allRows: Models.Row[] = [];

        try {
            // Update to processing
            update((jobs) => {
                const job = jobs.get(jobId);
                if (job) job.status = 'processing';
                return new Map(jobs);
            });

            // First fetch to get total
            const firstBatch = await sdk
                .forProject(config.region, config.project)
                .tablesDB.listRows({
                    databaseId: config.databaseId,
                    tableId: config.tableId,
                    queries: [
                        Query.limit(PAGE_SIZE),
                        Query.offset(0),
                        ...config.queries,
                        ...config.wildcardQueries
                    ]
                });

            const total = firstBatch.total;

            if (total > MAX_ROWS) {
                throw new Error(
                    `Table size (${total} rows) exceeds client-side export limit of ${MAX_ROWS}. Please apply filters to reduce the result set.`
                );
            }

            allRows = [...firstBatch.rows];
            offset = PAGE_SIZE;

            update((jobs) => {
                const job = jobs.get(jobId);
                if (job) {
                    job.totalRows = total;
                    job.fetchedRows = allRows.length;
                }
                return new Map(jobs);
            });

            // Paginate remaining
            while (allRows.length < total) {
                const batch = await sdk
                    .forProject(config.region, config.project)
                    .tablesDB.listRows({
                        databaseId: config.databaseId,
                        tableId: config.tableId,
                        queries: [
                            Query.limit(PAGE_SIZE),
                            Query.offset(offset),
                            ...config.queries,
                            ...config.wildcardQueries
                        ]
                    });

                // Guard against empty batches to prevent infinite loop
                if (batch.rows.length === 0) {
                    break;
                }

                allRows = [...allRows, ...batch.rows];
                offset += batch.rows.length;

                update((jobs) => {
                    const job = jobs.get(jobId);
                    if (job) {
                        job.fetchedRows = allRows.length;
                    }
                    return new Map(jobs);
                });
            }

            // Filter to selected columns
            const filteredRows = allRows.map((row) => {
                const filtered: Record<string, unknown> = {};
                for (const col of config.columns) {
                    if (col in row) {
                        filtered[col] = row[col];
                    }
                }
                return filtered;
            });

            // Create and trigger download
            const jsonString = config.prettyPrint
                ? JSON.stringify(filteredRows, null, 2)
                : JSON.stringify(filteredRows);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = config.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            update((jobs) => {
                const job = jobs.get(jobId);
                if (job) {
                    job.status = 'completed';
                    job.fetchedRows = filteredRows.length;
                }
                return new Map(jobs);
            });
        } catch (error) {
            update((jobs) => {
                const job = jobs.get(jobId);
                if (job) {
                    job.status = 'failed';
                    job.error = error instanceof Error ? error.message : 'Export failed';
                }
                return new Map(jobs);
            });
        }
    }

    function clear() {
        set(new Map());
    }

    function removeJob(jobId: string) {
        update((jobs) => {
            jobs.delete(jobId);
            return new Map(jobs);
        });
    }

    return {
        subscribe,
        startExport,
        clear,
        removeJob
    };
}

export const jsonExportStore = createJsonExportStore();
