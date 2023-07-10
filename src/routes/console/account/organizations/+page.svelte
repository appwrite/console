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
    import LL from '$i18n/i18n-svelte';

    export let data: PageData;

    const getMemberships = async (teamId: string) => {
        const memberships = await sdk.forConsole.teams.listMemberships(teamId);
        return memberships.memberships.map((team) => team.userName);
    };

    let addOrganization = false;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">{$LL.console.account.title.organization()}</Heading>

        <Button on:click={() => (addOrganization = true)} event="create_organization">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">{$LL.console.account.button.createOrg()}</span>
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
                        {organization?.total ? organization?.total : 'No'}
                        {$LL.console.account.texts.members()}
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        {organization.name}
                    </svelte:fragment>
                    {#await avatarList}
                        <span class="avatar is-color-empty" />
                    {:then avatars}
                        <AvatarGroup size={40} {avatars} />
                    {/await}
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>{$LL.console.account.texts.createOrg()}</p>
            </svelte:fragment>
        </CardContainer>
    {:else}
        <Empty single on:click={() => (addOrganization = true)}>
            <p>{$LL.console.account.texts.createOrg()}</p>
        </Empty>
    {/if}

    <PaginationWithLimit
        name="Organizations"
        limit={data.limit}
        offset={data.offset}
        total={data.organizations.total} />
</Container>

<CreateOrganization bind:show={addOrganization} />
