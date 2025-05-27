import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: 'domain', title: 'Domain', type: 'string', width: { min: 300 } },
    { id: 'registrar', title: 'Registrar', type: 'string', width: { min: 120 } },
    { id: 'nameservers', title: 'Nameservers', type: 'string', width: { min: 120 } },
    { id: 'expiry_date', title: 'Expiry Date', type: 'datetime', width: { min: 120 } },
    { id: 'renewal', title: 'Renewal', type: 'datetime', width: { min: 120 } },
    { id: 'auto_renewal', title: 'Auto Renewal', type: 'boolean', width: { min: 80 } }
]);
