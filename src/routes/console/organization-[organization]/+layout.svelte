<script lang="ts">
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { organization, newOrgModal, newMemberModal } from '$lib/stores/organization';
    import CreateMember from './_createMember.svelte';
    import Create from '../_createOrganization.svelte';
    import Header from './header.svelte';
    import Breadcrumbs from './breadcrumbs.svelte';

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
    }
</script>

<svelte:head>
    <title>Organizations - Appwrite</title>
</svelte:head>

{#if $organization}
    <slot />
{/if}

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
