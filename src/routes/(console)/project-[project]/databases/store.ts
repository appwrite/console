import type { Column } from '$lib/helpers/types';
import { isCloud } from '$lib/system';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>(
    isCloud
        ? [
              { id: '$id', title: 'Database ID', type: 'string', width: 200 },
              { id: 'name', title: 'Name', type: 'string', width: { min: 120 } },
              { id: 'backup', title: 'Backups', type: 'string', width: { min: 120 } },
              { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 120 } },
              { id: '$updatedAt', title: 'Updated', type: 'datetime', width: { min: 120 } }
          ]
        : [
              { id: '$id', title: 'Database ID', type: 'string', width: 200 },
              { id: 'name', title: 'Name', type: 'string', width: { min: 120 } },
              { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 120 } },
              { id: '$updatedAt', title: 'Updated', type: 'datetime', width: { min: 120 } }
          ]
);
