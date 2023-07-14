<script lang="ts">
    import { goto } from '$app/navigation';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '$routes/console/project-[project]/store';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import Template from './template.svelte';

    let search = '';

    let databases = [] as Models.DatabaseList['databases'];

    onMount(async () => {
        const { databases: newDatabases } = await sdk.forProject.databases.list();
        databases = newDatabases;
    });

    $: filteredDatabases = databases.filter((db) =>
        db.name.toLowerCase().includes(search.toLowerCase())
    );

    $: dbOptions = filteredDatabases.map(
        (db) =>
            ({
                group: 'databases',
                label: db.name,
                callback: () => {
                    goto(`/console/project-${$project.$id}/databases/database-${db.$id}`);
                }
            } as const)
    );
</script>

<Template options={dbOptions} bind:search>
    <div slot="option" let:option>{option.label}</div>
</Template>
