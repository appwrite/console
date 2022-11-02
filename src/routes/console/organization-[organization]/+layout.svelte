<script lang="ts">
    import { newOrgModal, newMemberModal } from '$lib/stores/organization';
    import CreateMember from './createMember.svelte';
    import Create from '../createOrganization.svelte';
</script>

<svelte:head>
    <title>Organizations - Appwrite</title>
</svelte:head>

<slot />

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
