<script lang="ts">
    import { pageLimit, updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import {
        organization,
        memberList,
        newOrgModal,
        newMemberModal
    } from '$lib/stores/organization';
    import CreateMember from './_createMember.svelte';
    import Create from '../_createOrganization.svelte';
    import { page } from '$app/stores';
    import { Query } from '@aw-labs/appwrite-console';
    import Header from './header.svelte';
    import Breadcrumbs from './breadcrumbs.svelte';

    $: organizationId = $page.params.organization;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promises = Promise.all([
            organization.load(organizationId),
            memberList.load(organizationId, [Query.limit($pageLimit)])
        ]);

        if ($organization?.$id !== organizationId) {
            await promises;
        }

        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Organizations</title>
</svelte:head>

{#if $organization}
    <slot />
{/if}

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
