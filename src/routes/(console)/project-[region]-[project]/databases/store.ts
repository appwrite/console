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

export function getDatabaseTypeTitle(database: Models.Database) {
    switch (database.type as DatabaseType) {
        default:
        case 'legacy':
        case 'tablesdb':
            return 'TablesDB';
        case 'documentsdb':
            return 'DocumentsDB';
        case 'vectordb':
            return 'VectorDB';
    }
}
