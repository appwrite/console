<script lang="ts">
    import { Icon, Layout, Tag, Tooltip } from '@appwrite.io/pink-svelte';
    import { queries, tagFormat, tags } from './store';
    import { IconX } from '@appwrite.io/pink-icons-svelte';
    import { parsedTags } from './setFilters';
    import { Button } from '$lib/elements/forms';
</script>

{#if $parsedTags?.length}
    <Layout.Stack direction="row" gap="s" wrap="wrap" alignItems="center" inline>
        {#each $parsedTags as tag}
            <span>
                <Tooltip
                    disabled={Array.isArray(tag.value) ? tag.value?.length < 3 : true}
                    maxWidth="600px">
                    <Tag
                        size="s"
                        on:click={() => {
                            const t = $tags.filter((t) => t.tag.includes(tag.tag.split(' ')[0]));
                            t.forEach((t) => (t ? queries.removeFilter(t) : null));
                            queries.apply();
                            parsedTags.update((tags) => tags.filter((t) => t.tag !== tag.tag));
                        }}>
                        {#key tag.tag}
                            <span use:tagFormat>{tag.tag}</span>
                        {/key}
                        <Icon icon={IconX} size="s" slot="end" />
                    </Tag>
                    <span slot="tooltip">{tag?.value?.toString()}</span>
                </Tooltip>
            </span>
        {/each}
        <Button
            size="s"
            text
            on:click={() => {
                queries.clearAll();
                queries.apply();
                parsedTags.set([]);
            }}>Clear all</Button>
    </Layout.Stack>
{/if}
