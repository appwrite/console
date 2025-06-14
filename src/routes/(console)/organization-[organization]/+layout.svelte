<script lang="ts">
    import { newOrgModal, newMemberModal } from '$lib/stores/organization';
    import CreateMember from './createMember.svelte';
    import Create from '../createOrganization.svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { registerCommands } from '$lib/commandCenter';
    import { requestedMigration } from '$routes/store';
    import { openMigrationWizard } from '../(migration-wizard)';
    import { base } from '$app/paths';
    import { isOwner } from '$lib/stores/roles';
    import type { PageData } from './$types';

    export let data: PageData;

    $: if ($requestedMigration) {
        openMigrationWizard();
    }

    $: $registerCommands([
        {
            label: 'Go to members',
            callback: () => {
                goto(`${base}/organization-${data.organization.$id}/members`);
            },
            keys: ['g', 'm'],
            disabled: page.url.pathname.endsWith('/members') || !$isOwner,
            group: 'navigation'
        },
        {
            label: 'Go to settings',
            callback: () => {
                goto(`${base}/organization-${data.organization.$id}/settings`);
            },
            keys: ['g', 's'],
            disabled: page.url.pathname.endsWith('/settings') || !$isOwner,
            group: 'navigation'
        }
    ]);
</script>

<svelte:head>
    <title>Organizations - Appwrite</title>
</svelte:head>

<slot />

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
