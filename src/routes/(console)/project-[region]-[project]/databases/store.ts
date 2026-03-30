import { isCloud } from '$lib/system';
import { writable } from 'svelte/store';
import type { Column } from '$lib/helpers/types';
import type { Models } from '@appwrite.io/console';
import type { DatabaseType } from '$database/(entity)';

export const columns = writable<Column[]>(
    isCloud
        ? [
              { id: '$id', title: 'Database ID', type: 'string', width: 200 },
              { id: 'type', title: 'Type', type: 'string', width: { min: 180 } },
              { id: 'name', title: 'Name', type: 'string', width: { min: 180 } },
              { id: 'backup', title: 'Backups', type: 'string', width: { min: 180 } },
              { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 180 } },
              { id: '$updatedAt', title: 'Updated', type: 'datetime', width: { min: 180 } }
          ]
        : [
              { id: '$id', title: 'Database ID', type: 'string', width: 200 },
              { id: 'type', title: 'Type', type: 'string', width: { min: 180 } },
              { id: 'name', title: 'Name', type: 'string', width: { min: 180 } },
              { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 180 } },
              { id: '$updatedAt', title: 'Updated', type: 'datetime', width: { min: 180 } }
          ]
);

export const databaseTypes: Array<{
    type: DatabaseType;
    title: string;
    subtitle: string;
}> = [
    {
        type: 'dedicateddb',
        title: 'DedicatedDB',
        subtitle:
            'Always-on dedicated instances with high availability. Best for production workloads.'
    },
    {
        type: 'tablesdb',
        title: 'TablesDB',
        subtitle:
            'Structure your data in rows and columns. Best for relational data and advanced querying.'
    },
    {
        type: 'documentsdb',
        title: 'DocumentsDB',
        subtitle:
            'Store flexible data without a fixed schema. Best for unstructured data and simple querying.'
    },
    {
        type: 'vectorsdb',
        title: 'VectorsDB',
        subtitle:
            'Store data as vectors to find similar results. Best for semantic search and recommendations.'
    }
];

export function getDatabaseTypeTitle(database: Models.Database & { engine?: string }) {
    switch (database.type as DatabaseType) {
        case 'dedicateddb': {
            const engine = database.engine || 'postgres';
            const engineName =
                engine === 'postgres' ? 'PostgreSQL' : engine === 'mysql' ? 'MySQL' : engine;
            return `Dedicated ${engineName}`;
        }
        default:
        case 'legacy':
        case 'tablesdb':
            return 'TablesDB';
        case 'documentsdb':
            return 'DocumentsDB';
        case 'vectorsdb':
            return 'VectorsDB';
    }
}
