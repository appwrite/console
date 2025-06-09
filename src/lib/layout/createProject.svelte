<script lang="ts">
    import { Layout, Typography, Input, Tag, Icon, Alert } from '@appwrite.io/pink-svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { CustomId } from '$lib/components/index.js';
    import { getFlagUrl } from '$lib/helpers/flag';
    import { isCloud } from '$lib/system.js';
    import { currentPlan } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { filterRegions } from '$lib/helpers/regions';

    export let projectName: string;
    export let id: string;
    export let regions: Array<Models.ConsoleRegion> = [];
    export let region: string;
    export let showTitle = true;
    export let projects: number = undefined;

    let showCustomId = false;
</script>

<svelte:head>
    {#each regions as region}
        <link rel="preload" as="image" href={getFlagUrl(region.flag)} />
    {/each}
</svelte:head>

<form on:submit|preventDefault>
    <Layout.Stack direction="column" gap="xxl">
        {#if showTitle}
            <Typography.Title size="l">Create your project</Typography.Title>
        {/if}
        {#if projects && projects >= $currentPlan?.projects}
            <Alert.Inline status="warning" title="You’ve reached your limit of 2 projects">
                Extra projects are available on paid plans for an additional fee
                <svelte:fragment slot="actions">
                    <Button href={`${base}/organization-${page.params.organization}/billing`} external text>Upgrade</Button>
                </svelte:fragment>
            </Alert.Inline>
        {/if}
        <Layout.Stack direction="column" gap="xxl">
            <Layout.Stack direction="column" gap="xxl">
                <Layout.Stack direction="column" gap="s">
                    <Input.Text
                        label="Name"
                        placeholder="Project name"
                        required
                        bind:value={projectName} />
                    {#if !showCustomId}
                        <div>
                            <Tag
                                size="s"
                                on:click={() => {
                                    showCustomId = true;
                                }}><Icon slot="start" icon={IconPencil} size="s" /> Project ID</Tag>
                        </div>
                    {/if}
                    <CustomId bind:show={showCustomId} name="Project" isProject bind:id />
                </Layout.Stack>
                {#if isCloud && regions.length > 0}
                    <Layout.Stack gap="xs">
                        <Input.Select
                            required
                            bind:value={region}
                            placeholder="Select a region"
                            options={filterRegions(regions)}
                            label="Region" />
                        <Typography.Text>Region cannot be changed after creation</Typography.Text>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </Layout.Stack>
        <slot name="submit"></slot>
    </Layout.Stack>
</form>
