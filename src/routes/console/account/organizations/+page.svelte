<script lang="ts">
    import { base } from '$app/paths';
    import {
        GridItem1,
        Empty,
        AvatarGroup,
        CardContainer,
        Heading,
        PaginationWithLimit
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import CreateOrganization from '../../createOrganization.svelte';
    import { sdk } from '$lib/stores/sdk';
    import type { PageData } from './$types';
    import { isCloud } from '$lib/system';
    import { Pill } from '$lib/elements';
    import type { Models } from '@appwrite.io/console';
    import type { Organization } from '$lib/stores/organization';

    export let data: PageData;

    const getMemberships = async (teamId: string) => {
        const memberships = await sdk.forConsole.teams.listMemberships(teamId);
        return memberships.memberships.map((team) => team.userName);
    };

    function isCloudOrg(
        data: Partial<Models.TeamList<Models.Preferences>> | Organization
    ): data is Organization {
        return isCloud ? true : false;
    }

    let addOrganization = false;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Organizations</Heading>

        <Button on:click={() => (addOrganization = true)} event="create_organization">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create organization</span>
        </Button>
    </div>

    {#if data.organizations.teams.length}
        <CardContainer
            total={data.organizations.total}
            offset={data.offset}
            event="organization"
            on:click={() => (addOrganization = true)}>
            {#each data.organizations.teams as organization}
                {@const avatarList = getMemberships(organization.$id)}
                <GridItem1 href={`${base}/console/organization-${organization.$id}`}>
                    <svelte:fragment slot="eyebrow">
                        {organization?.total ? organization?.total : 'No'} members
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        {organization.name}
                    </svelte:fragment>
                    <svelte:fragment slot="status">
                        {#if isCloudOrg(organization)}
                            {#if organization?.billingPlan === 'tier-0'}
                                <Pill>FREE</Pill>
                            {/if}
                            {#if organization?.billingTrialStartDate && organization?.billingTrialDays}
                                <Pill>FREE TRIAL</Pill>
                            {/if}
                        {/if}
                    </svelte:fragment>
                    {#await avatarList}
                        <span class="avatar is-color-empty" />
                    {:then avatars}
                        <AvatarGroup size={40} {avatars} />
                    {/await}
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new organization</p>
            </svelte:fragment>
        </CardContainer>
    {:else}
        <Empty single on:click={() => (addOrganization = true)}>
            <p>Create a new organization</p>
        </Empty>
    {/if}

    <PaginationWithLimit
        name="Organizations"
        limit={data.limit}
        offset={data.offset}
        total={data.organizations.total} />
</Container>

<CreateOrganization bind:show={addOrganization} />
