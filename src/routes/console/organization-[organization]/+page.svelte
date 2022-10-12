<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Pill } from '$lib/elements';
    import { GridItem1, Empty, Pagination } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { Query, type Models } from '@aw-labs/appwrite-console';
    import { projectList } from '$lib/stores/organization';
    import { project } from '../project-[project]/store';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import CreateOrganization from '../_createOrganization.svelte';
    import CreateProject from './_createProject.svelte';
    import { cardLimit } from '$lib/stores/layout';
    import CardContainer from '$lib/components/cardContainer.svelte';
    import { createPersistentPagination } from '$lib/stores/pagination';

    $: organizationId = $page.params.organization;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        await projectList.load([
            Query.offset($offset),
            Query.limit($cardLimit),
            Query.equal('teamId', organizationId)
        ]);
    }

    let showCreate = false;
    let addOrganization = false;
    const offset = createPersistentPagination($cardLimit);

    const projectCreated = async (event: CustomEvent<Models.Project>) => {
        await project.load(event.detail.$id);
        await goto(`${base}/console/project-${event.detail.$id}`);
    };

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

    // $: projectList.load('', limit, offset);
    // $: projects = $projectList?.projects?.filter((a) => a.teamId === organizationId);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Projects</h2>

        <Button
            on:click={() => {
                showCreate = true;
            }}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create project</span>
        </Button>
    </div>

    {#if $projectList?.total}
        <CardContainer
            total={$projectList.total}
            offset={$offset}
            on:click={() => (showCreate = true)}>
            {#each $projectList.projects as project, index}
                {#if index >= $offset && index < $cardLimit + $offset}
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
        <Empty isButton single on:click={() => (showCreate = true)}>
            <p>Create a new project</p>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {$projectList?.total}</p>
        <Pagination limit={$cardLimit} bind:offset={$offset} sum={$projectList?.total} />
    </div>
</Container>

<CreateOrganization bind:show={addOrganization} />

<CreateProject bind:show={showCreate} teamId={organizationId} on:created={projectCreated} />
