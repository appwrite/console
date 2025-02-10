<script lang="ts">
    import { queries, tagFormat, tags } from './store';
    import { Tooltip } from '@appwrite.io/pink-svelte';
</script>

{#each $tags as tag (tag)}
    <Tooltip disabled={Array.isArray(tag.value) ? tag.value?.length < 3 : true}>
        <button
            type="button"
            class="tag"
            on:click|preventDefault={() => {
                queries.removeFilter(tag);
                queries.apply();
            }}>
            <span class="text" use:tagFormat>
                {tag.tag}
            </span>
            <i class="icon-x" />
        </button>
        <span slot="tooltip">{tag?.value?.toString()}</span>
    </Tooltip>
{/each}
