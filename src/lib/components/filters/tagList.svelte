<script lang="ts">
    import { IconX } from '@appwrite.io/pink-icons-svelte';
    import { tagFormat, type TagValue } from './store';
    import { Icon, Tag, Tooltip } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let tags: TagValue[];
    const dispatch = createEventDispatcher();
</script>

{#each tags as tag (tag)}
    <span>
        <Tooltip
            disabled={Array.isArray(tag.value) ? tag.value?.length < 3 : true}
            maxWidth="600px">
            <Tag
                size="s"
                on:click={() => {
                    dispatch('remove', tag);
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
