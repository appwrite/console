<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Pill } from '$lib/elements';
    import { Bucket, EmptyBucket, Empty, Pagination } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import type { Models } from '@aw-labs/appwrite-console';
    import CreateOrganization from './_createOrganization.svelte';
    import CreateProject from './_createProject.svelte';
    import { organization, projectList } from './store';
    import { onMount } from 'svelte';

    let projects: Models.Project[] = [];

    onMount(async () => {
        await projectList.load();

        projects = $projectList.projects.filter((n) => n.teamId === $organization.$id);
    });

    let showCreate = false;
    let addOrganization = false;
    let currentOrganization = $organization?.$id;
    let offset = 0;
    const limit = 5;

    const projectCreated = async (event: CustomEvent<Models.Project>) => {
        await goto(`${base}/console/${event.detail.$id}`);
    };

    const platformsName = {
        web: 'Web',
        'flutter-ios': 'Flutter',
        'flutter-android': 'Flutter',
        ios: 'Apple',
        android: 'Android',
        unity: 'Unity'
    };
    const platformsIcon = {
        web: 'code',
        'flutter-ios': 'flutter',
        'flutter-android': 'flutter',
        ios: 'apple',
        android: 'android',
        unity: 'unity'
    };

    $: if (currentOrganization !== $organization?.$id) {
        currentOrganization = $organization.$id;
        projectList.load();
        projects = $projectList.projects.filter((a) => a.teamId === $organization.$id);
    }
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

    {#if projects?.length}
        <ul
            class="grid-box common-section u-margin-block-start-32"
            style={`--grid-gap:2rem; --grid-item-size:${projects.length > 3 ? '22rem' : '25rem'};`}>
            {#each projects as project}
                <Bucket href={`${base}/console/${project.$id}`}>
                    <svelte:fragment slot="eyebrow"
                        >{project?.platforms?.length ? project?.platforms?.length : 'No'} apps</svelte:fragment>
                    <svelte:fragment slot="title">
                        {project.name}
                    </svelte:fragment>
                    {@const platformList = project.platforms.map((platform) => platform.type)}
                    {@const platforms = Array.from(new Set(platformList))}
                    {#each platforms as platform, i}
                        {#if i < 3}
                            <Pill>
                                <span
                                    class={`icon-${platformsIcon[platform]}`}
                                    aria-hidden="true" />
                                {platformsName[platform]}
                            </Pill>
                        {/if}
                    {/each}
                    {#if platforms?.length > 3}
                        <Pill>
                            +{project.platforms.length - 3}
                        </Pill>
                    {/if}
                </Bucket>
            {/each}
            {#if projects.length % 2 !== 0}
                <EmptyBucket on:click={() => (showCreate = true)}>
                    <div class="common-section">
                        <Button secondary round>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p>Create a new project</p>
                    </div>
                </EmptyBucket>
            {/if}
        </ul>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {projects.length}</p>
            <Pagination {limit} bind:offset sum={projects.length} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="bucket">
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <Button secondary round on:click={() => (showCreate = true)}>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p>Create a new project</p>
                    </div>
                </div>
            </div>
        </Empty>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {projects.length}</p>
            <Pagination {limit} bind:offset sum={projects.length} />
        </div>
    {/if}
</Container>

<CreateOrganization bind:show={addOrganization} />

<CreateProject
    bind:show={showCreate}
    bind:teamId={currentOrganization}
    on:created={projectCreated} />
