<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { queries, tagFormat, tags } from './store';
</script>

{#each $tags as tag (tag)}
    <button
        use:tooltip={{
            content: tag?.value?.toString(),
            disabled: Array.isArray(tag.value) ? tag.value?.length < 3 : true
        }}
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
{/each}
