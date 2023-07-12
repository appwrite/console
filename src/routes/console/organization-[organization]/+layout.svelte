<script lang="ts">
    import { newOrgModal, newMemberModal } from '$lib/stores/organization';
    import CreateMember from './createMember.svelte';
    import Create from '../createOrganization.svelte';
    import LL from '$i18n/i18n-svelte';
</script>

<svelte:head>
    <title>{$LL.console.organization.title.organization()} - Appwrite</title>
</svelte:head>

<slot />

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
