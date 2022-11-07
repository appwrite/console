<script lang="ts">
    import { base } from '$app/paths';
    import { Pill } from '$lib/elements';
    import { GridItem1, Heading, Empty, CardContainer, Pagination } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import CreateProject from '../createProject.svelte';
    import CreateOrganization from '../../createOrganization.svelte';
    import type { PageData } from './$types';
    import { CARD_LIMIT } from '$lib/constants';
    import { page } from '$app/stores';

    export let data: PageData;

    let showCreate = false;
    let addOrganization = false;

    const getPlatformInfo = (platform: string) => {
        let name: string, icon: string;
        if (platform.includes('flutter')) {
            name = 'Flutter';
            icon = 'flutter';
        } else if (platform.includes('apple')) {
            name = 'Apple';
            icon = 'apple';
        } else if (platform.includes('android')) {
            name = 'Android';
            icon = 'android';
        } else if (platform.includes('unity')) {
            name = 'Unity';
            icon = 'unity';
        } else if (platform.includes('web')) {
            name = 'Web';
            icon = 'code';
        } else {
            name = 'Unknown';
            icon = 'unknown';
        }
        return { name, icon };
    };
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Projects</Heading>
        <Button
            on:click={() => {
                showCreate = true;
            }}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create project</span>
        </Button>
    </div>

    {#if data.projects.total}
        <CardContainer
            total={data.projects.total}
            offset={data.offset}
            on:click={() => (showCreate = true)}>
            {#each data.projects.projects as project, index}
                {#if index >= data.offset && index < CARD_LIMIT + data.offset}
                    <GridItem1 href={`${base}/console/project-${project.$id}`}>
                        <svelte:fragment slot="eyebrow">
                            {project?.platforms?.length ? project?.platforms?.length : 'No'} apps
                        </svelte:fragment>
                        <svelte:fragment slot="title">
                            {project.name}
                        </svelte:fragment>
                        {@const platformList = project.platforms.map((platform) => platform.type)}
                        {@const platforms = Array.from(new Set(platformList))}
                        {#each platforms as platform, i}
                            {#if i < 3}
                                <Pill>
                                    <span
                                        class={`icon-${getPlatformInfo(platform).icon}`}
                                        aria-hidden="true" />
                                    {getPlatformInfo(platform).name}
                                </Pill>
                            {/if}
                        {/each}
                        {#if platforms?.length > 3}
                            <Pill>
                                +{project.platforms.length - 3}
                            </Pill>
                        {/if}
                    </GridItem1>
                {/if}
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new project</p>
            </svelte:fragment>
        </CardContainer>
    {:else}
        <Empty single on:click={() => (showCreate = true)}>
            <p>Create a new project</p>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {data.projects.total}</p>
        <Pagination
            path={`/console/organization-${$page.params.organization}`}
            limit={CARD_LIMIT}
            offset={data.offset}
            sum={data.projects.total} />
    </div>
</Container>

<CreateOrganization bind:show={addOrganization} />

<CreateProject bind:show={showCreate} teamId={$page.params.organization} />
