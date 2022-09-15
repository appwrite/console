<script lang="ts">
    import { base } from '$app/paths';
    import { GridItem1, EmptyGridItem, Empty, Pagination, AvatarGroup } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import CreateOrganization from '../../_createOrganization.svelte';
    import { organizationList } from '$lib/stores/organization';
    import { onMount } from 'svelte';
    import { sdkForConsole } from '$lib/stores/sdk';

    onMount(async () => {
        await organizationList.load();
    });

    const getAvatar = (name: string) => {
        return sdkForConsole.avatars.getInitials(name, 80, 80).toString();
    };

    const getMemberships = async (teamId: string) => {
        const memberships = await sdkForConsole.teams.getMemberships(teamId);
        return memberships.memberships.map((team) => {
            return {
                name: team.userName,
                img: getAvatar(team.userName)
            };
        });
    };

    let addOrganization = false;
    let offset = 0;
    const limit = 6;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Organizations</h2>

        <Button
            on:click={() => {
                addOrganization = true;
            }}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create organization</span>
        </Button>
    </div>

    {#if $organizationList?.teams?.length}
        <ul
            class="grid-box common-section u-margin-block-start-32"
            style={`--grid-gap:1.5rem; --grid-item-size:${
                $organizationList.total > 3 ? '22rem' : '25rem'
            };`}>
            {#each $organizationList.teams as organization, index}
                {@const avatarList = getMemberships(organization.$id)}
                {#if index >= offset && index < limit + offset}
                    <GridItem1 href={`${base}/console/organization-${organization.$id}`}>
                        <svelte:fragment slot="eyebrow"
                            >{organization?.total ? organization?.total : 'No'} projects</svelte:fragment>
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
            {#if $organizationList?.total < limit + offset && ($organizationList?.total % 2 !== 0 || $organizationList?.total % 4 === 0)}
                <EmptyGridItem on:click={() => (addOrganization = true)}>
                    <div class="common-section">
                        <Button secondary round>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p>Create a new organization</p>
                    </div>
                </EmptyGridItem>
            {/if}
        </ul>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$organizationList?.total}</p>
            <Pagination {limit} bind:offset sum={$organizationList?.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="grid-item-1">
                <div class="u-flex u-flex-vertical u-cross-center ">
                    <div class="common-section">
                        <Button secondary round on:click={() => (addOrganization = true)}>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p>Create a new organization</p>
                    </div>
                </div>
            </div>
        </Empty>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$organizationList?.total}</p>
            <Pagination {limit} bind:offset sum={$organizationList?.total} />
        </div>
    {/if}
</Container>

<CreateOrganization bind:show={addOrganization} />
