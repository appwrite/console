<script lang="ts">
    import { goto } from '$app/navigation';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import Template from './template.svelte';

    let search = '';

    let organizations = [] as Models.TeamList<Models.Preferences>['teams'];

    onMount(async () => {
        organizations = (await sdk.forConsole.teams.list()).teams;
    });

    $: filteredOrganizations = organizations
        .filter((organization) => organization.name.toLowerCase().includes(search.toLowerCase()))
        .map((organization) => {
            return {
                label: organization.name,
                callback: () => {
                    goto(`/console/organization-${organization.$id}`);
                },
                group: 'organizations'
            } as const;
        });
</script>

<Template options={filteredOrganizations} bind:search>
    <div class="option" slot="option" let:option>{option.label}</div>
</Template>
