<script lang="ts">
    import { Layout, Typography, Input, Tag, Icon } from '@appwrite.io/pink-svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { CustomId } from '$lib/components/index.js';
    import type { Region } from '$lib/sdk/billing';
    import { getFlagUrl } from '$lib/helpers/flag';
    import { isCloud } from '$lib/system.js';

    export let projectName: string;
    export let id: string;
    export let regions: Array<Region> = [];
    export let region: string;
    export let showTitle = true;

    let showCustomId = false;

    function getRegions() {
        return regions
            .filter((region) => region.$id !== 'default')
            .sort((regionA, regionB) => {
                if (regionA.disabled && !regionB.disabled) {
                    return 1;
                }
                return regionA.name > regionB.name ? 1 : -1;
            })
            .map((region) => {
                return {
                    label: region.name,
                    value: region.$id,
                    leadingHtml: `<img src='${getFlagUrl(region.flag)}' alt='Region flag'/>`,
                    disabled: region.disabled
                };
            });
    }
</script>

<svelte:head>
    {#each regions as region}
        <link rel="preload" as="image" href={getFlagUrl(region.flag)} />
    {/each}
</svelte:head>
<form>
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
                                }}><Icon icon={IconPencil} /> Project ID</Tag>
                        </div>
                    {/if}
                    <CustomId bind:show={showCustomId} name="Project" isProject bind:id />
                </Layout.Stack>
                {#if isCloud && regions.length > 0}
                    <Layout.Stack gap="xs"
                        ><Input.Select
                            bind:value={region}
                            placeholder="Select a region"
                            options={getRegions()}
                            label="Region" />
                        <Typography.Text>Region cannot be changed after creation</Typography.Text>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </Layout.Stack>
        <slot name="submit"></slot>
    </Layout.Stack>
</form>
