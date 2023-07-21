<script lang="ts">
    import { newMemberModal, newOrgModal } from '$lib/stores/organization';
    import { requestedMigration } from '$routes/store';
    import { openMigrationWizard } from '../(migration-wizard)';
    import Create from '../createOrganization.svelte';
    import CreateMember from './createMember.svelte';

    $: if ($requestedMigration) {
        openMigrationWizard();
    }
</script>

<svelte:head>
    <title>Organizations - Appwrite</title>
</svelte:head>

<slot />

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
