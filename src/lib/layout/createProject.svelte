<script lang="ts">
    import { Layout, Typography, Input, Tag, Icon, Button } from '@appwrite.io/pink-svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { CustomId } from '$lib/components/index.js';
    import type { Region } from '$lib/sdk/billing';
    import { getFlagUrl } from '$lib/helpers/flag';
    import { isCloud } from '$lib/system.js';

    export let projectName: string;
    export let showCustomId: boolean;
    export let id: string;
    export let regions: Array<Region> = [];
    export let region: string;
    export let createProject: () => Promise<void>;

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

<form>
    <Layout.Stack direction="column" gap="xxl">
        <Typography.Title size="l">Create your project</Typography.Title>
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
                    <CustomId
                        bind:show={showCustomId}
                        name="Project"
                        isProject
                        bind:id
                        fullWidth={true} />
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
        <Layout.Stack direction="row" justifyContent="flex-end"
            ><Button.Button type="button" variant="primary" size="s" on:click={createProject}>
                Create</Button.Button>
        </Layout.Stack>
    </Layout.Stack>
</form>
