import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: 'domain', title: 'Domain', type: 'string', width: { min: 300 } },
    { id: 'registrar', title: 'Registrar', type: 'string' },
    { id: 'nameservers', title: 'Nameservers', type: 'string' },
    { id: 'expiry_date', title: 'Expiry Date', type: 'datetime' },
    { id: 'renewal', title: 'Renewal', type: 'boolean' },
    { id: 'auto_renewal', title: 'Auto Renewal', type: 'boolean' }
]);
