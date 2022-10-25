<script lang="ts">
    import { organization, newOrgModal, newMemberModal } from '$lib/stores/organization';
    import CreateMember from './_createMember.svelte';
    import Create from '../_createOrganization.svelte';
</script>

<svelte:head>
    <title>Organizations - Appwrite</title>
</svelte:head>

{#if $organization}
    <slot />
{/if}

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
