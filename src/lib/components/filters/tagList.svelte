<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';

    import { queries, tags, type TagValue } from './store';

    function tagFormat(node: HTMLElement) {
        node.innerHTML = node.innerHTML.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }

    // We cast to any to not cause type errors in the input components
    /* eslint  @typescript-eslint/no-explicit-any: 'off' */
    function isTypeTagValue(obj: any): obj is TagValue {
        if (typeof obj === 'string') return false;
        return (
            obj &&
            typeof obj.tag === 'string' &&
            (typeof obj.value === 'string' ||
                typeof obj.value === 'number' ||
                Array.isArray(obj.value))
        );
    }
</script>

{#each $tags as tag (tag)}
    {#if isTypeTagValue(tag)}
        <button
            use:tooltip={{
                content: tag?.value?.toString()
            }}
            class="tag"
            on:click={() => {
                queries.removeFilter(tag);
                queries.apply();
            }}>
            <span class="text" use:tagFormat>
                {tag.tag}
            </span>
            <i class="icon-x" />
        </button>
    {:else}
        <button
            class="tag"
            on:click={() => {
                queries.removeFilter(tag);
                queries.apply();
            }}>
            <span class="text" use:tagFormat>
                {tag}
            </span>
            <i class="icon-x" />
        </button>
    {/if}
{/each}
