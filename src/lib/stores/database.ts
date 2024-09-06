import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import { type Models, Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { headerAlert } from '$lib/stores/headerAlert';
import BackupDatabase from '$lib/components/billing/alerts/backupDatabase.svelte';

export const database = derived(page, ($page) => $page.data?.database as Models.Database);

export const showPolicyAlert = writable<boolean>(false);

export async function checkForDatabaseBackupPolicies(database: Models.Database) {
    let total = 0;
    try {
        const policies = await sdk.forProject.backups.listPolicies([
            Query.limit(1),
            Query.equal('resourceId', database.$id)
        ]);

        total = policies.total;
    } catch (e) {
        // ignore, backups not allowed on free plan error.
    }

    showPolicyAlert.set(total <= 0);

    if (!total) {
        headerAlert.add({
            id: 'databasesBackup',
            component: BackupDatabase,
            show: true,
            importance: 7
        });
    }
}
