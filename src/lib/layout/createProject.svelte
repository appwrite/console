<script lang="ts">
    import { Layout, Typography, Input, Tag, Icon } from '@appwrite.io/pink-svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { CustomId } from '$lib/components/index.js';
    import { getFlagUrl } from '$lib/helpers/flag';
    import { isCloud } from '$lib/system.js';
    import type { Models } from '@appwrite.io/console';
    import { filterRegions } from '$lib/helpers/regions';

    export let projectName: string;
    export let id: string;
    export let regions: Array<Models.ConsoleRegion> = [];
    export let region: string;
    export let showTitle = true;

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
