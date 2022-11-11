<script lang="ts">
    import { base } from '$app/paths';
    import {
        GridItem1,
        Empty,
        Pagination,
        AvatarGroup,
        CardContainer,
        Heading
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import CreateOrganization from '../../../createOrganization.svelte';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { CARD_LIMIT } from '$lib/constants';
    import type { PageData } from './$types';

    export let data: PageData;

    const getMemberships = async (teamId: string) => {
        const memberships = await sdkForConsole.teams.listMemberships(teamId);
        return memberships.memberships.map((team) => team.userName);
    };

    let addOrganization = false;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Organizations</Heading>

        <Button
            on:click={() => {
                addOrganization = true;
            }}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create organization</span>
        </Button>
    </div>

    {#if data.organizations.teams.length}
        <CardContainer
            total={data.organizations.total}
            offset={data.offset}
            on:click={() => (addOrganization = true)}>
            {#each data.organizations.teams as organization, index}
                {@const avatarList = getMemberships(organization.$id)}
                {#if index >= data.offset && index < CARD_LIMIT + data.offset}
                    <GridItem1 href={`${base}/console/organization-${organization.$id}`}>
                        <svelte:fragment slot="eyebrow">
                            {organization?.total ? organization?.total : 'No'} projects
                        </svelte:fragment>
                        <svelte:fragment slot="title">
                            {organization.name}
                        </svelte:fragment>
                        {#await avatarList}
                            <span class="avatar  is-color-empty" />
                        {:then avatars}
                            <AvatarGroup size={40} {avatars} />
                        {/await}
                    </GridItem1>
                {/if}
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
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {data.organizations.total}</p>
        <Pagination
            limit={CARD_LIMIT}
            path="console/account/organizations"
            offset={data.offset}
            sum={data.organizations.total} />
    </div>
</Container>

<CreateOrganization bind:show={addOrganization} />
